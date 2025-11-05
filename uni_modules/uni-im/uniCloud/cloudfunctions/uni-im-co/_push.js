async function sendPushMsg(param, appId) {
  // 本方法仅用于暴露给数据库触发器调用（或者在本云对象的其它方法内部调用）
  if (this.getMethodName() === 'sendPushMsg' && this.getClientInfo().source !== 'function') {
    throw {
      errSubject: 'uni-im-co-sendPushMsg',
      errCode: 0,
      errMsg: '本方法仅用于暴露给数据库触发器调用'
    }
  }

  let pushParam = {
    // 验证token是否有效，无效则不向此设备推送消息
    check_token: true,
    settings: {
      //-1表示不设离线，因为离线后重新打开数据统一从数据库中拉取。否则会重复
      ttl: -1,
      // strategy:{
        // 1: 表示该消息在设备在线时推送个推通道，设备离线时推送厂商通道;
        // 3: 表示该消息只通过个推通道下发，不考虑设备是否在线；

      //   "default":2
      // }
    },
    // 离线推送厂商信息配置，需要到云厂商后台申请
    channel: {
      // 华为离线推送
      "HW": "NORMAL",
      // 小米离线推送
      "XM": "114240",
      "OP": "114240",
      "VV": 1
    },
    options: {
      "HW": {
        "/message/android/notification/default_sound": true,
        "/message/android/notification/importance": "NORMAL",
        "/message/android/notification/channel_id": "114240",
        "/message/android/notification/sound": "pushsound",
        "/message/android/category": "IM"
      },
      "VV": {
        "/category": "IM", //二级分类。
      },
      "OP": {
        "/channel_id": "114240"
      },
      "HO": {
        "/android/notification/importance": "NORMAL"
      }
    }
  }
  /**
   * 如果不指定接收消息的客户端appid，则指定为消息推送者的客户端appid。
   * 用于两个客户端appid不同的场景，比如电商项目，商家和普通用户端appid不同
   */
  // 调用扩展插件的初始化接口
  const { invokeExts } = require('uni-im-ext')
  invokeExts('ext-before-send-push',this.clientInfo)
  
  if (!appId) {
    appId = this.clientInfo.appId
    console.log('this.clientInfo',this.clientInfo);
    if (!appId) {
      throw new Error('appId is not definded')
      console.error('####################appId is not definded, use default appId:', appId)
    }
  }
  // 如果是uni-im特殊消息，默认不走厂商通道，只走个推通道
  if (param.payload.type == "uni-im") {
    const msgData = param.payload.data
    let noPushOffline = false
    if (msgData.type === 'system' || msgData.type === 'revoke_msg') {
      noPushOffline = true
    } else {
      // 如果是扩展的消息类型，由扩展模块决定是否需要离线推送
      const { msgTypes } = require('uni-im-ext')
      let msgType = await msgTypes.get(msgData.type)
      if (msgType && msgType.noPushOffline) {
        noPushOffline = msgType.noPushOffline(msgData)
      }
    }
    if (noPushOffline) {
      // console.error('uni-im特殊消息，默认不走厂商通道，只走个推通道')
      pushParam.settings.strategy = {
        "default": 3
      }
    }
  }
  
  // 深合并pushParam, param
  (function deepMerge(target, source) {
    if (typeof target !== 'object' || typeof source !== 'object') {
      return;
    }
    for (const key in source) {
      if (typeof target[key] === 'object' && typeof source[key] === 'object') {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  })(pushParam, param);
  // console.log('pushParam', pushParam)
  // console.log('pushParam.channel', pushParam.channel)
  
  // 解决没有购买个推vip套餐，设置推送策略为3无效的问题
  if (pushParam.settings && pushParam.settings.strategy === 3) {
    delete pushParam.title
    delete pushParam.content
  }
  
  // 如果是im通知消息（比如：加好友申请，用户请求加群，用户退群等），则记录到数据表uni-im-notification中
  if (param.payload.type == "uni-im-notification") {
    let {
      title,
      content,
      payload,
      sound,
      open_url,
      path,
      user_id
    } = pushParam
    let notificationContent = {
      title,
      content,
      payload,
      sound,
      open_url,
      path
    }
    notificationContent.is_read = false
    notificationContent.create_time = Date.now()
    let notificationData;
    // 如果接收消息的用户量不止一个，则需要插入数据表的记录为多条（数组）
    if (Array.isArray(user_id)) {
      notificationData = user_id.map(uid => {
        return {
          user_id: uid,
          ...notificationContent
        }
      })
    } else {
      notificationData = Object.assign(notificationContent, {
        user_id
      })
    }
    // 执行写入到数据库
    let db = uniCloud.database()
    let uinRes = await db.collection('uni-im-notification').add(notificationData)
    // console.log('uinRes',uinRes)
    param.payload.notificationId = uinRes.id
  }

  // WS 推送：clear-conversation-unreadCount 消息推送给自己
  if (pushParam.payload.type === 'uni-im' && pushParam.payload.data.type === 'clear-conversation-unreadCount') {
    let msgData = pushParam.payload.data
    const { invokeExts } = require('uni-im-ext')
    await invokeExts('push-msg-notify', {
      to_uids: [msgData.to_uid],
      msg: {
        type: 'clear-conversation',
        conversation_id: msgData.conversation_id,
      }
    })
  }

  let res = await uniCloud.getPushManager({
    appId,
    debug: false,
  }).sendMessage(pushParam)
  console.log('sendPushMsg res', res,pushParam)
  if (res.errCode) {
    console.error(res.errCode);
    console.error(res.errMsg);
    if (res.errCode == "uni-push-user-invalid" || res.errMsg == "target user is invalid") {
      // 可能因为用户长时间没有登录，或客户端获取到的push_clientid错误;导致的cid无效而发送失败，但是此时已将离线数据写入数据库，登录后可获取。客户端不需要进入 catch
      res = {
        data: {
          "uni-push-err-res": res
        },
        errCode: 0
      }
    } else {
      console.error(res.errCode);
      throw new Error(res.errMsg)
    }
  }
  return res
}

module.exports = {
  sendPushMsg
}
