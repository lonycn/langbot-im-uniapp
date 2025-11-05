async function onMsgTypeRegister() {
  return {
    type: 'read_msg',

    // 消息是否可见
    isReadable(msgData) {
      return false
    },

    // 消息是否需要保存到数据库
    noPersistent(msgData) {
      return true
    },

    // 消息推送时是否需要厂商通道（离线也能推送）
    noPushOffline(msgData) {
      return true
    },

    /**
     * @param {object} params 客户端调用云端 sendMsg() 时提交的参数对象
     * @param {string} current_uid 当前用户
     */
    async beforeSendMsg(params, current_uid) {
      const db = uniCloud.database()
      const dbCmd = db.command
      const dbUniImMsg = db.collection('uni-im-msg')
      const dbUniImConversation = db.collection('uni-im-conversation')

      // 我的会话包含此消息
      // 1. 查到此消息
      let { data: [msgData] } = await dbUniImMsg
        .doc(params.body.msgId)
        .field({
          conversation_id: true,
          reader_list: true,
          group_id: true,
          from_uid: true,
          appid: true
        })
        .get()
      if (!msgData) {
        throw new Error('要设为已读的消息不存在')
      } else {
        // console.log('msgData', msgData);
      }
      if (msgData.reader_list && msgData.reader_list.some(item => item.user_id == current_uid)) {
        throw new Error('你已经在此消息的已读列表中')
      }
      // 2. 查我是否在这个消息所在的会话中，且此会话必须有效
      let { data: [conversation] } = await dbUniImConversation
        .where({
          id: msgData.conversation_id,
          user_id: current_uid,
          leave: dbCmd.neq(true)
        })
        .get()
      // console.log('read_msg.beforeSendMsg: conversation:', conversation);
      if (!conversation) {
        throw new Error('你不在“要设为已读的消息”所在的会话')
      }
      // 3. 往这个消息的已读字段中，添加当前用户的id
      let res = await dbUniImMsg
        .doc(params.body.msgId)
        .update({
          reader_list: dbCmd.push({
            user_id: current_uid,
            create_time: Date.now()
          })
        })
      // console.log('res', res);
      params.appId = msgData.appid
      if (msgData.group_id) {
        params.group_id = msgData.group_id
      } else {
        // 通知消息的发送者，有人读了他的消息
        params.to_uid = msgData.from_uid
      }
    }
  }
}

module.exports = {
  onMsgTypeRegister,
}
