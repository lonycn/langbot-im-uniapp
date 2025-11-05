import $extensions from '../methods/extensions.js';
import appEvent from '@/uni_modules/uni-im/sdk/utils/appEvent.js';
export default class EasyWebNotification {
  constructor(arg) {
    if (!("Notification" in window)) {
      this.create = () => {
        console.error("该浏览器不支持桌面通知");
      }
      return console.error("该浏览器不支持桌面通知");
    }
    // 如果没有授权且未被拒绝,则请求授权
    if (!["denied","granted"].includes(Notification.permission)) {
      this.requestPermission()
    }
    this.oldBrowserTitle = document.title
    appEvent.onAppActivate(async () => {
      // console.log('onAppActivate----978699',this.oldBrowserTitle);
      if (this.setBrowserTitleInterval) {
        this.recoverTitle()
        //关闭所有通知栏
        this.closeAllNotification()
      }
    })
  }
  // 设置浏览器标题的定时器
  setBrowserTitleInterval = false;
  // 原始的浏览器标题
  oldBrowserTitle = null;
  // 所有浏览器通知对象
  notificationList = []
  closeAllNotification() {
    this.notificationList.forEach(i => i.close())
  }
  requestPermission(callback) {
    function isSafari() {
      var userAgent = navigator.userAgent.toLowerCase();
      var safari = /safari/.test(userAgent);
      var chrome = /chrome/.test(userAgent);
      return (safari && !chrome);
    }

    if (isSafari()) {
      // 为页面添加一个提示，点击后设置浏览器通知权限
      if (!document.getElementById('requestPushPermission')) {
        let requestPushPermissionDom = document.createElement('div')
        requestPushPermissionDom.id = 'requestPushPermission'
        requestPushPermissionDom.innerHTML = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.5); z-index: 9999;">
                                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding:15px; border-radius:5px;">
                                                    <p>请先设置授权使用浏览器消息通知</p>
                                                    <div style="display: flex; justify-content: space-around;">
                                                        <button style="padding: 8px 20px;margin-top: 15px;background: #fff; border: 1px solid #ccc; border-radius: 5px;cursor: pointer;">关闭</button>
                                                        <button style="padding: 8px 20px;margin-top: 15px;background: #176fff;color:#FFF; border: none; border-radius: 5px;cursor: pointer;">设置</button>
                                                    </div>
                                                </div>
                                              </div>`
        document.body.appendChild(requestPushPermissionDom)
        // 请求权限后，关闭按钮
        const btns = requestPushPermissionDom.querySelectorAll('button')
        for (let i = 0; i < btns.length; i++) {
          btns[i].onclick = function() {
            requestPushPermissionDom.remove()
            if(i === 1){
                Notification.requestPermission().then(permission => {
                    console.log('permission',permission,permission === "granted");
                    if (permission === "granted" && typeof callback == 'function') callback()
                });
            }
          }
        }
      }
    } else {
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted" && typeof callback == 'function') callback()
      });
    }
  }
  async create({
    title,
    option,
    path
  } = {
    "title": "通知标题", // 定义一个通知的标题，当它被触发时，它将显示在通知窗口的顶部。
    "option": { // 可选
      // "badge":"https://web-assets.dcloud.net.cn/unidoc/zh/uni-app.png",// 一个 USVString 包含用于表示通知的图像的 URL，当没有足够的空间来显示通知本身时。
      // 	"body":"一个 DOMString 表示通知的正文，将显示在标题下方",// 一个 DOMString 表示通知的正文，将显示在标题下方。
      // 	"tag":"代表通知的 一个识别标签",// 一个 DOMString 代表通知的 一个识别标签。
      "icon": "https://web-assets.dcloud.net.cn/unidoc/zh/uni.png", // 一个 USVString 包含要在通知中显示的图标的 URL。
      // "image":"https://web-assets.dcloud.net.cn/unidoc/zh/uni.png",// 一个 USVSTring包含要在通知中显示的图像的 URL。
      // 	"data":"您想要与通知相关联的任意数据。这可以是任何数据类型。",// 您想要与通知相关联的任意数据。这可以是任何数据类型。
      // 	"vibrate":true,// 一个振动模式 vibration pattern (en-US) 设备的振动硬件在通知触发时发出。
      // 	"renotify":true,// 一个 Boolean (en-US) 指定在新通知替换旧通知后是否应通知用户。默认值为 false，这意味着它们不会被通知。
      // 	"requireInteraction":true,// 表示通知应保持有效，直到用户点击或关闭它，而不是自动关闭。默认值为 false。
      // 	"noscreen":true
    }
  }) {
    // 标题条闪烁提醒，缺省要闪烁，除非有扩展程序要求不闪烁
    let flashTitleBar = true
    if ($extensions.invokeExts('ui-flash-title-bar').includes(false)) {
      flashTitleBar = false
    }
    if (flashTitleBar) {
      if (!this.setBrowserTitleInterval) {
        this.oldBrowserTitle = document.title
        let toggle = false
        this.setBrowserTitleInterval = setInterval(() => {
          document.title = (
            toggle
            ? '【\u3000\u3000\u3000\u3000\u3000】'
            : '【收到新消息】'
          ) + this.oldBrowserTitle;
          toggle = !toggle
        }, 300);
      }
    }
  
    // 未同意 再申请一次
    if (Notification.permission != "granted") {
      await this.requestPermission()
      // 仍然未同意，放弃创建
      if (Notification.permission != "granted") {
        return console.error('用户未授权，浏览器通知消息权限')
      }
    }

    // 调用扩展点，查询是否有扩展程序拒绝
    let permissions = await Promise.all($extensions.invokeExts('ui-notification-permission'))
    if (permissions.includes(false)) {
      return
    }

    // 创建通知栏消息
    const notification = new Notification(title, option);
    this.notificationList.push(notification)
    // 添加点击通知后的操作
    notification.onclick = (event) => {
      // 调用扩展程序告知点击操作
      $extensions.invokeExts('ui-notification-clicked')

      // 恢复通浏览器标题栏内容
      this.recoverTitle()

      //如果通知消息被点击,通知窗口将被激活
      window.focus();

      //关闭所有通知栏
      this.closeAllNotification()

      // 打开相关的会话
      if (option.conversation_id) {
        uni.$emit('uni-im-toChat', option.conversation_id)
      }

      event.preventDefault(); // 阻止浏览器聚焦于 Notification 的标签页
    };
    // 添加通知消失后的操作
    notification.onclose = function() {
      // console.log("Notification closed");
    };
    notification.onerror = function(err) {
      console.error("onerror", err);
    };
    notification.onshow = function(e) {
      // console.log("onshow", e);
    };
  }

  recoverTitle() {
    clearInterval(this.setBrowserTitleInterval)
    this.setBrowserTitleInterval = false
    document.title = this.oldBrowserTitle;
  }
}