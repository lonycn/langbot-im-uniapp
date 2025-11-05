import $state from '@/uni_modules/uni-im/sdk/state/index.js';

export default () => {
  // console.log('onlyOneWebTab');
  if (!('BroadcastChannel' in window)) {
    return console.info('当前浏览器不支持BroadcastChannel')
  }
  const bc = new BroadcastChannel('uni-im-onlyOneWebTab');
  // 发送消息
  const msg = 'Is there any other IM window available' + " msgId:" + Math.random().toString(36).substring(7).padStart(12, '0');
  bc.postMessage(msg);
  // 接收消息
  bc.onmessage = (ev) => {
    // console.log(ev.data)
    if (ev.data.indexOf('Is there any other IM window available') === 0) {
      bc.postMessage('yes,about' + ev.data);
    } else if (ev.data === 'yes,about' + msg) {
      console.log('收到响应，说明当前浏览器其他选项卡已打开uni-im。通知其他关闭');
      bc.postMessage("please close");
    } else if (ev.data === "please close") {
      $state.indexDB.close();
      $state.isDisabled = true;

      setTimeout(() => {
        document.title = "uni-im（已掉线）";
      }, 1000);

      // 弹窗提示，其他选项卡已打开uni-im，当前页面已失效，点击重新打开
      uni.showModal({
        title: '掉线提醒',
        content: '已在其他页面发起会话，当前页面已掉线',
        showCancel: false,
        confirmText: '重新连接',
        success: async res=>{
          if (res.confirm) {
            // console.log('用户点击确定');
            // 点击确定，发送消息，其他选项卡关闭uni-im
            bc.postMessage("please close");
            // 刷新当前页面
            location.reload();
          }
        },
        fail: function(res) {
          console.log(res.errMsg);
        },
      });

    }
  };

  // Close the channel
  // bc.close();
}