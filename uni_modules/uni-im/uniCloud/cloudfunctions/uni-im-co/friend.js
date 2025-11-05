const {
  db,
  md5,
} = require('uni-im-utils')

async function addFriendInvite({
  to_uid,
  message
}) {
  const from_uid = this.current_uid
  // console.log('from_uid-----', from_uid);
  if (this.current_uid == to_uid) {
    throw new Error('不能加自己为好友')
  }

  let {
    data: [has]
  } = await db.collection('uni-im-friend').where({
    user_id: from_uid,
    friend_uid: to_uid
  }).get()

  if (has) {
    return {
      errSubject: 'uni-im-co',
      errCode: 1000,
      errMsg: '已经是好友'
    }
  }

  // 检查是不是黑名单
  //略		
  let docId = md5(JSON.stringify([from_uid, to_uid]))

  // 不存在就添加，存在就更新
  let res = await db.collection('uni-im-friend-invite').doc(docId)
    .set({
      from_uid,
      to_uid,
      message
    })

  // console.log({
  // 	res
  // });
  /*const dbJQL = uniCloud.databaseForJQL({
    clientInfo
  })
  dbJQL.setUser({
    uid: from_uid, // 建议此处使用真实uid
    role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
    permission: []
  })*/

  const dbJQL = uniCloud.databaseForJQL({
    clientInfo: this.clientInfo
  })
  let {
    data: [userInfo]
  } = await dbJQL.collection('uni-id-users')
    .doc(this.current_uid)
    .field('_id,nickname,avatar_file')
    .get()
  // console.log({
  // 	userInfo
  // });
  let {
    nickname
  } = userInfo
  let title = nickname.slice(0, 20),
    content = message || "请求添加对方为好友"
  let pushParam = {
    user_id: to_uid,
    payload: {
      type: "uni-im-notification", // im消息通知，比如加好友请求，有用户退群等
      subType: "uni-im-friend-invite", // 通知子类型（可选）
      avatar_file: userInfo.avatar_file, // 头像或图标的图片地址，支持Base64
      confirmText: "同意", // 确认按钮的文字（可选）
      // cancelText: "拒绝", // 取消按钮的文字（可选）
      state: false, // 是否已经处理过 false 未处理，confirm：已确认，cancel：已拒绝（可选）
      unique: from_uid, // 去重字段，比如同一个用户重复申请加好友，通知数据始终只显示一条，但是会通知多次（可选）
      data: { // 自定义的其他参数（可选）
        _id: docId,
        from_uid
      },
      path: false
    },
    title, // "收到im消息，离线时显示的标题",
    content, //"离线时显示的内容"
    path: false
  }

  return await this.sendPushMsg(pushParam, this.clientInfo.appId)
}

module.exports = {
  addFriendInvite,
}
