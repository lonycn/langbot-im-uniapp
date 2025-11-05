import getCloudMsg from './getCloudMsg.js';
import $state from '@/uni_modules/uni-im/sdk/state/index.js';
import $methods from '@/uni_modules/uni-im/sdk/methods/index.js';
import clearData from './clearData'

const imData = {
  onInitAfter(callback){
    if ($state.ext._initImData.isInit) {
      callback()
    } else {
      // nvue下跨页面的数据不能共享，所以_initImData.callbackList需要挂到$state下
      $state.ext._initImData.callbackList.push(callback)
    }
  },
  async init() {
		// 初始化之前先将旧的清空，解决不调用退出登录直接直达登录页面换账号的情况
		clearData()
    // console.log('初始化数据 data');
    let storageConversationList = []
    
    // #ifdef H5
    storageConversationList = []
    
    // 暂时关闭本地库相关逻辑
    // await new Promise((resolve, reject) => {
    //   let requst = $state.indexDB.transaction("uni-im-convasation")
    //     .objectStore("uni-im-convasation")
    //     .getAll()
    //   requst.onsuccess = function (event) {
    //     resolve(event.target.result)
    //   }
    //   requst.onerror = function (event) {
    //     console.error('获取本地会话列表失败', event)
    //     resolve([])
    //   }
    // })
    // #endif
    
    
    if (storageConversationList.length) {
      $state.conversation.add(storageConversationList)
    }
    // getCloudMsg({
    //   showLoading: "加载中",
    //   async callback(){
    //     /*console.log('启动后通过getCloudMsg拉取了会话数据，和直接云端全量拉做对比');
    //     let localConversations = [...$state.conversation.dataList]
    //     let localLength = localConversations.length
    //     const uniImCo = uniCloud.importObject("uni-im-co",{
    //       customUI:true
    //     })
    //     uniImCo.getConversationList({
    //       limit: 30
    //     }).then(res => {
    //       // console.log('拉取了云端会话数据', res.data);
    //       // 取30个对比
    //       // console.log('本地会话数据', localConversations);
    //       let newConversations = res.data
    //       function tr(arr){
    //         arr = arr
    //           .map(({update_time,id,group_info,user_info}) => {
    //             let item = {
    //               update_time,
    //               id
    //             }
    //             if(group_info){
    //               const {name,type} = group_info
    //               item.group = {name,type}
    //             }
    //             if(user_info){
    //               const {nickname} = user_info
    //               item.user_info = {nickname}
    //             }
    //             return item
    //           })
    //           .sort((a, b) => b.update_time - a.update_time)
    //           // 去重id相等的去掉
    //         let tmpObj = {}
    //         arr.forEach(item => {
    //           tmpObj[item.id] = item
    //         })
    //         arr = Object.values(tmpObj)
    //         arr = arr.slice(0, localLength > 20 ? 20 : localLength)
    //         console.log('arr.length', arr.length,arr);
    //         return JSON.stringify(arr)
    //       }
          
    //       localConversations = tr(localConversations)
    //       newConversations = tr(newConversations)
          
    //       // console.log('localConversations', localConversations.length, localConversations);
    //       // console.log('newConversations', newConversations.length, newConversations);
    //       if (localConversations === newConversations) {
    //         console.log('会话数据一致，无需更新');
    //       }else{
    //         console.error('会话数据不一致，需要更新');
    //         // 把不一致的项console.log出来
    //         let local = JSON.parse(localConversations)
    //         let newC = JSON.parse(newConversations)
    //         local.forEach((item, index) => {
    //           // 缺少的项
    //           if (!newC.find(i => i.id === item.id)) {
    //             console.error('缺少的项', item);
    //           }
    //         })
    //         newC.forEach((item, index) => {
    //           // 多余的项
    //           if (!local.find(i => i.id === item.id)) {
    //             console.error('多余的项', item);
    //           }
    //         })
    //         $state.conversation.dataList = []
    //         res.data.forEach(item => {
    //           $state.conversation.add(item)
    //         })
    //       }
    //     })
    //     .catch(err => {
    //       console.error('拉取会话数据失败', err);
    //     })*/
        
        // 初始化完成
        $state.ext._initImData.isInit = true
        $state.ext._initImData.callbackList.forEach(fn => {
          // console.error(' 初始化成功后执行',$state.ext._initImData.isInit);
          fn();
        })
        
    //   }
    // })
    
    
    $state.notification.loadMore()
    $state.friend.loadMore()
    $state.group.loadMore()
		const user_id = $state.currentUser._id
		if(user_id){
			$state.users.merge({
				[user_id]: $state.currentUser
			})
		}
		const db = uniCloud.databaseForJQL()
		db.collection('uni-im-user-alias')
			.where("user_id == $cloudEnv_uid")
			.limit(1000)
			.get()
			.then(res => {
				// console.log('获取用户别名成功', res.data);
				$state.userAlias = res.data.reduce((aliasMap, item) => {
          aliasMap[item.target_uid] = item.content
          return aliasMap
        }, {})
			})
			.catch(err => {
				console.error('获取用户别名失败', err);
			})
  }
}

// 将数据初始化完成事件，挂到 sdk 下
$methods.onInitDataAfter = imData.onInitAfter

export default imData