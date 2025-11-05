import config from '@/uni_modules/uni-im/common/config.js';
import $state from '@/uni_modules/uni-im/sdk/state/index.js';
import $methods from '@/uni_modules/uni-im/sdk/methods/index.js';
import $ext from '@/uni_modules/uni-im/sdk/ext/index.js';
import {init as initIndexDB} from '@/uni_modules/uni-im/sdk/ext/indexDB.js';
import $utils from '@/uni_modules/uni-im/sdk/utils';

import checkVersion from './checkVersion'
import onAppActivateStateChange from './onAppActivateStateChange'
import onNotification from './onNotification';

import clearData from './clearData'
import msgEvent from './msgEvent'
import getCloudMsg from './getCloudMsg'
import onSocketStateChange from './onSocketStateChange'
import imData from './imData'
import onlyOneWebTab from './onlyOneWebTab'


// #ifdef APP
// import sqlite from './sqlite.js'
// #endif

const modules = {
  checkVersion,
  onAppActivateStateChange,
  clearData,
  msgEvent,
  getCloudMsg,
  onSocketStateChange,
  imData,
  onlyOneWebTab,
  onNotification
};


// console.log('modules', modules);

const version = '3.0.0';

export default async function (initParam) {
  // console.log('initParam:', initParam, this)
  // 检查当前客户端版本号，如果低于最新版本，App端提示升级。其他端需要做本地数据的清洗
  modules.checkVersion(version);

  // 注册（扩展的）消息类型
  $methods.msgTypes.registerTypes()

    
  // #ifdef H5
  // 限制 im 在浏览器内只能由一个页签打开
  modules.onlyOneWebTab();
  try {
    // 初始化 indexDB （如果版本号不一致会自动清空过期数据）
    const initIndexDBRes = await initIndexDB(version);
    $state.indexDB = initIndexDBRes.target.result;
  } catch (e) {
    console.error(e)
    uni.showModal({
      content: JSON.stringify(e),
      showCancel: false
    });
  }
  
  // 监听所有错误并上报
  window.addEventListener('error', function(e) {
    console.error('监听所有错误并准备上报 error', e)
    $utils.reportError(e.error)
  });
  
  $state.networkConnected = navigator.onLine;
  window.addEventListener('online', function() {
    $state.networkConnected = true;
    console.log('网络已连接');
  });
  window.addEventListener('offline', function() {
    $state.networkConnected = false;
    console.log('网络已断开');
  });
  // #endif
  
  // #ifndef H5
  // uni.onNetworkStatusChange(({
  // 	networkType
  // }) => {
  // 	if (this.networkType == 'none' && networkType != 'none') { //之前没网现在有了
  // 		this.$emit('networkResume')
  // 	}
  // 	this.networkType = networkType;
  // });
  // uni.getNetworkType({
  // 	success: ({
  // 		networkType
  // 	}) => {
  // 		this.networkType = networkType;
  // 	}
  // });
  // #endif
  
  
  // 如果已经登录就直接初始化数据
  if ($state.currentUser.tokenExpired > Date.now()) {
    await modules.imData.init()
  } else {
    console.log("登录状态过期，暂不初始化数据");
  }
  // 登录成功后 初始化数据
  uni.$on('uni-id-pages-login-success', async () => {
    console.log("登录成功，开始初始化数据");
    modules.imData.init()
  });
  
  modules.imData.onInitAfter(() => {
    //初始化完毕后
    // 读取 云端{"未读会话id":未读数}的数据
		const uniImCo = uniCloud.importObject("uni-im-co")
		uniImCo.getUnreadCount()
      .then(({data}) => {
        // console.log('读取云端未读会话数据', data)
				$state.conversation.cloudUnreadCountObj = data.unreadCountObj
      })
      .catch(e => {
        console.error('读取云端未读会话数据失败', e)
        // uni.showModal({
        //   content: '读取云端未读会话数据失败' + JSON.stringify(e),
        //   showCancel: false
        // });
      })

    // 移除监听，避免重复监听
    uni.offPushMessage(onPushMsg)
    // 监听推送消息
    uni.onPushMessage(onPushMsg)
  })
  function onPushMsg(res){
    // console.log('uni_on_PushMessage', res.data.payload);
    switch (res.data.payload.type) {
      case "uni-im":
        modules.msgEvent.emitMsg(res)
        break;
      case "uni-im-notification":
        modules.onNotification(res) //添加好友相关模块，暂不维护
        break;
      default:
        break;
    }
  }

  // 监听并记录socket连接状态
  modules.onSocketStateChange((state, count) => {
    this.socketConnectState = state;
    if (count > 1) {
      // 大于1，说明是断开后重连；获取socket断开时丢失的数据
      modules.getCloudMsg()
    }
  });
  // console.log('this.socketConnectState', this.socketConnectState);
  
  // 监听应用处于“活动状态”，并记录状态和变成活动状态的次数。
  modules.onAppActivateStateChange((state, count) => {
    this.appActivateState = state;
    if (!state) return;
    // #ifdef APP
    this.socketConnectState = state;
    if(!$state.ext._previewImageIsOpen){
      //清理系统通知栏消息和app角标
      plus.push.clear()
      plus.runtime.setBadgeNumber(0)
      // 查询一次缺失的云端消息
      modules.getCloudMsg()
    } else {
      $state.ext._previewImageIsOpen = false
    }
    // #endif
    
    // 拿到当前页面的路由
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const isLoginPage = currentPage?.route.includes('uni_modules/uni-id-pages/pages/login')
    
    // 第二次 activate 之后开始 检查token是否已经过期，如果已经过期则重定向至登录页面
    const { tokenExpired } = $state.currentUser
    if (!currentPage?.options?.oauthToken && !isLoginPage && count > 1 && tokenExpired < Date.now()) {
      console.info('uni-im检测到，当前用户登录过且当前登录状态已过期，将自动跳转至登录页面。')
      uni.reLaunch({
        url: '/uni_modules/uni-id-pages/pages/login/login-withpwd',
        complete(e) {
          console.log('uni.reLaunch to login page', e)
        }
      })
    }
  });

  // 退出登录时，清空(归零)相关数据
  uni.$on('uni-id-pages-logout', () => modules.clearData());
  
  $state.onMsg = modules.msgEvent.onMsg
  $state.offMsg = modules.msgEvent.offMsg
  
  // #ifndef H5
  // 提前拿到键盘高度，防止第一次在会话点击输入框时，输入框的高度弹起速度慢
  $state.keyboardMaxHeight = uni.getStorageSync('uni-im-data-keyboard-max-height') || 0;
  // console.log('键盘高度', $state.keyboardMaxHeight);
  // if ($state.keyboardMaxHeight === 0) {
  //   uni.onKeyboardHeightChange((e) => {
  //     if (e.height > $state.keyboardMaxHeight) {
  //       $state.keyboardMaxHeight = e.height;
  //       uni.setStorageSync('uni-im-data-keyboard-max-height', e.height);
  //       console.log('获取到键盘高度，并存储', e.height);
  //     }
  //   });
  // }
  // #endif

  // #ifdef APP
  // 初始化 本地数据库
  // sqlite.init();
  // 将sqlite对象存储到全局变量下
  // getApp().globalData.sqlite = sqlite;
  
  // android 平台设置推送通道渠道id
  if (uni.getSystemInfoSync().platform == "android") {
    try{
      const plugin = uni.requireNativePlugin("DCloud-PushSound");
      plugin.setCustomPushChannel(
        {
          // soundName: "pushsound",
          channelId: config.uniPush.channel.id,
          channelDesc: config.uniPush.channel.desc,
          enableLights: true,
          enableVibration: true,
          importance: 4,
          lockscreenVisibility: 1
        }
      );
    }catch(e){
      // console.error('android 平台设置推送通道渠道id',e);
    }
  }
  // #endif

  //时间戳心跳（定时器）用于刷新：消息或会话与当前的时间差。ps：全局共享一个定时器变量。比启多个定时器性能更好
  setInterval(() => {
    $state.heartbeat = Date.now();
  }, 1000)

  // 监听窗口变化
  // #ifdef H5
  function setIsWidescreen() {
    let oldState = $state.isWidescreen
    $state.isWidescreen = window.innerWidth > 960
  }
  window.addEventListener('resize',setIsWidescreen);
  setIsWidescreen();
  // #endif

  const audioContext = uni.createInnerAudioContext()
  let _audioContext = {}
  Object.defineProperty(_audioContext, 'src', {
    set(url) {
      audioContext.src = url;
    },
    get() {
      return audioContext.src;
    }
  })
  $state.audioContext = new Proxy(_audioContext, {
    get(target, propKey, receiver) {
      return audioContext[propKey]
    }
  })
  
  // 获取系统信息
  $state.systemInfo = uni.getSystemInfoSync()
  // todo: 临时方案，为了解决部分老设备同步方法获取到的信息不准确的问题
  uni.getSystemInfo({
    success: (res) => {
      $state.systemInfo = res;
      // console.log('this.systemInfo',$state.systemInfo);
    },
    fail: (e) => {
      console.error('获取系统信息失败', e);
    }
  });

  // 检测屏幕特性
  if ($state.systemInfo.deviceType === 'pc') {
    // pc 只支持宽屏模式（会限制 page 的 min-width）
    $state.isWidescreen = true
    $state.isTouchable = false
  } else {
    // 其它设备类型由屏幕宽度来判定
    $state.isWidescreen = $state.systemInfo.screenWidth >= 960
    $state.isTouchable = true
  }

  // #ifdef H5
  // 同步 键盘弹出/收起后，动态变化的窗口高度
  window.addEventListener('resize', () => {
    $state.systemInfo.windowHeight = window.innerHeight
  })
  // #endif

  // 通过拦截器监听路由变化，解决在非tabbar页面，无法设置TabBarBadge的问题
  let list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'];
  list.forEach((item) => {
    uni.addInterceptor(item, {
      success: event => {
        // 更新底部选项卡角标值
        updateTabBarBadge()
      }
    })
  })

  // #ifdef MP-WEIXIN
  // 微信的隐式API 监听路由变化
  wx.onAppRoute((res) => {
    // console.log('跳转', res)
    // 更新底部选项卡角标值
    updateTabBarBadge()
  })
  // #endif

  // 更新底部选项卡角标值
  function updateTabBarBadge() {
    setTimeout(() => {
      // console.log('updateTabBarBadge');
      /**
       * 默认每次路由发生变化都会更新updateTabBarBadge的值
       * 你可以根据自己的项目情况优化，比如首页就是tabbar的可以判断getCurrentPages().length 的长度决定是否继续
       */

      let unread_count = $state.notification.unreadCount()
      // console.log({unread_count});
      $utils.setTabBarBadge(2, unread_count)

      // 获取未读会话消息总数
      unread_count = $state.conversation.unreadCount()
      // console.log({unread_count});
      $utils.setTabBarBadge(0, unread_count)
      // 设置底部选项卡角标值
    }, 300);
  }

  // #ifdef H5
  uni.addInterceptor('switchTab', {
    invoke: (e) => {
      if (e.url.includes('/uni_modules/uni-im/pages/index/index')) {
        if ($state.matches) {
          let param = getUrlParam(e.url)
          // console.log('param----',param);
          if (param) {
            uni.$emit('uni-im-toChat', param)
          }
        }
      }
    }
  })

  function getUrlParam(url) {
    let u = url.split("?");
    if (typeof (u[1]) == "string") {
      u = u[1].split("&");
      let get = {};
      for (let i in u) {
        let j = u[i].split("=");
        get[j[0]] = j[1];
      }
      return get;
    } else {
      return {};
    }
  };
  // #endif

  // #ifdef H5
  if ($methods.extensions.hasExt('ui-esc')) {
    // 如果有扩展程序需要处理 ESC 键，则监听 ESC 键并传递给扩展程序
    $utils.appEvent.onKeyDown((evt) => {
      $methods.extensions.invokeExts('ui-esc')
      return true
    }, {
      order: 1000,
      match: {
        key: 'Escape',
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
      }
    })
  }
  
  if (navigator.platform.indexOf('Win') > -1) {
    // win 系统时给 dom 最外层加一个class .windows方便样式调整
    document.body.classList.add('windows');
  }
  // #endif
  
  // uni.previewImage打开事件
  uni.addInterceptor('previewImage', {
    invoke: (e) => {
      // #ifdef APP
      $state.ext._previewImageIsOpen = true
      // console.log('previewImage打开')
      // #endif
    },
    success: (res) => {  
      // #ifdef H5
      setTimeout(() => {
        const previewImageDom = document.getElementById('u-a-p')
        const onDownEscapeKey = () => {
          // console.log('Escape')
          previewImageDom.getElementsByTagName('uni-swiper-item')[0].click()
          return true
        }
        $utils.appEvent.onKeyDown(onDownEscapeKey, {
          order: 0,
          match: {
            key: 'Escape',
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
          }
        })
      
      // uni.previewImage关闭事件
        const closePreviewImage = () => {
          // console.log('关闭previewImage')
          $utils.appEvent.offKeyDown(onDownEscapeKey)
          previewImageDom.removeEventListener('click',closePreviewImage)
        }
        previewImageDom.addEventListener('click',closePreviewImage)
        
        // 临时方案，只有一张图片时，不显示导航条
        const swiperCount = previewImageDom.getElementsByTagName('uni-swiper-item').length
        if (swiperCount < 2) {
          let navigationDomList = previewImageDom.getElementsByClassName('uni-swiper-navigation')
          navigationDomList[0].remove()
          navigationDomList[0].remove()
        }
      },0)
      // #endif
    }
  })
  
  $utils.appEvent.onAppActivate(() => {
    $state.ext.appIsActive = true
  })
  $utils.appEvent.onAppDeactivate(() => {
    $state.ext.appIsActive = false
  })
	
	
	async function doLogin(param){
		if(param.login){
			try {
				param.login = JSON.parse(param.login)
				await $ext.login(param.login)
			} catch (error) {}
		}
	}
	$methods.extensions.installExt('index-load-before-extra',doLogin)
	$methods.extensions.installExt('chat-load-before-extra',doLogin)
	
}
