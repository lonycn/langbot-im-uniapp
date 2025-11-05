const {
  db,
  dbCmd,
  $,
  getConversationId,
  checkParam
} = require('uni-im-utils')

const dbUniImMsg = db.collection('uni-im-msg')
const dbUniImConversation = db.collection('uni-im-conversation')
const dbUniImGroupMember = db.collection('uni-im-group-member')
const dbUniImFriend = db.collection('uni-im-friend')

// 获取 uni-im 配置
const createConfig = require("uni-config-center");
const uniImConfig = createConfig({
  pluginId: 'uni-im', // 插件 id
})
const conversation_grade = uniImConfig.config('conversation_grade')
const { invokeExts } = require('uni-im-ext')
// 发送消息方法（含：单聊和群聊）
async function sendMsg(params) {
  
  // 执行扩展点 beforeSendMsg
  let [beforeSendMsgRes] = await invokeExts('before-send-msg', params, this)
  // console.error('beforeSendMsgRes:', beforeSendMsgRes)
  if (beforeSendMsgRes === false) {
    throw new Error('扩展点 beforeSendMsgRes 出错')
  }


  await _beforeSendMsgActions.call(this, params)

  let {
    // 指定接收消息的用户 id
    to_uid,
    // 指定接收消息的群 id
    group_id,
    // 消息内容
    body,
    // 消息类型
    type,
    // 是否为失败 重试
    isRetries,
    // 接收消息的客户端的 DCloud appid
    appId,
    // 回复关联的消息的 id
    about_msg_id,
    call_uid,
    action,
    // 是否为静默消息
    is_mute,
		// 不保存消息到数据库
		noSaveToDB
  } = params

  // 清除旧版三方系统客户端直传的 call_uid 参数
  call_uid = []

  // 校验参数是否合法
  checkParam(params, {
    required: ["body", "type", "appId"],
    type: {
      to_uid: ["String"],
      group_id: ["String"],
      body: ["String", "Object", "Array"],
      type: ["String"],
      isRetries: ["Boolean"],
      appId: ["String"],
      about_msg_id: ['String'],
      action: ['String'],
      is_mute: ['Boolean'],
      chat_source: ['Object'],
			noSaveToDB: ['Boolean']
    }
  })

  // 存在 action 时，如果不是其他云函数或者触发器调用时，且调用者也不是系统时，拦截非法操作。
  if (action && this.getClientInfo().source != 'function' && this.current_uid != 'system') {
    throw new Error('非法操作')
  }

  // 调用扩展点 valid-msg
  let result = await invokeExts('validate-msg', params, this)
  let isValid = result.find(valid => typeof valid !== 'undefined')
	
	// 只有扩展点允许，或者id为system的用户可以发送:静音 或者 不保存消息 的消息
  if (
		!isValid && this.current_uid !== 'system' && 
		(is_mute !== undefined || noSaveToDB !== undefined)
	 ) {
    throw new Error('非法操作')
  }

  // 补充特殊校验
  if (!to_uid && !group_id) {
    throw new Error('接收消息的用户 id 和群 id 最少指定一个') // alert：否则表示将消息群发
  }

  // 其他云函数或者触发器调用时，消息类型才能用 system
  if (this.getClientInfo().source != 'function' && type == 'system') {
    throw new Error('非法消息类型')
  }

  if (type == 'text' && typeof body != 'string') {
    throw new Error('错误：type 为 text 类型，但 body 的类型确不是 string')
  }

  // 发送者身份 id
  const from_uid = this.current_uid

  await _checkConversationGrade.call(this, {
    from_uid,
    to_uid,
    group_id,
  })

  // TODO: 群聊时，需要校验当前用户是否为群成员，后续会优化性能问题
  if (this.current_uid != 'system' && group_id) {
    let {
      data: [member]
    } = await dbUniImGroupMember
      .where({
        group_id,
        user_id: this.current_uid
      })
      .get()
    // console.log('member', member);
    if (!member) {
      throw new Error('非群成员不能发起会话')
    } else if (!['creator', 'admin'].includes(...member.role) && member.mute_type > 0) {
      throw new Error('你已被禁言')
    }
  }

  let nickname = "系统消息",avatar_file = "";
  if (from_uid && from_uid != 'system') {
    const { data: [userInfo] } = await db.collection('uni-id-users').doc(from_uid).get()
    if (userInfo) {
      nickname = userInfo.nickname
      avatar_file = userInfo.avatar_file
    } else {
      return {
        "code": 30202,
        "errCode": "uni-id-check-token-failed",
        "errMsg": "请重新登录"
      }
    }
  }

  // 生成会话 id
  const conversation_id = getConversationId({group_id,from_uid,to_uid})
  // 现在的时间戳
  const nowTimestamp = Date.now()
  // 构建基本消息内容
  const msgData = {
    body,
    type,
    from_uid,
    // 消息发送者昵称
    nickname,
    // 消息发送者头像文件
    avatar_file,
    to_uid,
    // 是否已读，默认为：false
    is_read: false,
    // 创建时间
    create_time: nowTimestamp,
    // 更新时间，默认为创建时间
    update_time: nowTimestamp,
    conversation_id,
    group_id,
    appid: appId, // 接收消息的 appid（撤回消息时会用到）
    about_msg_id,
    call_uid, // @某些人
    action,
    reader_list: [], // 已读消息的用户列表
    is_mute, // 是否为静默消息
		noSaveToDB, // 不保存消息到数据库
		from_ip: this.getClientInfo().clientIP
  }
	
  if (type === 'rich-text') {
    let callUid = []
    for (let node of msgData.body) {
      if (node.name == 'span' && node.attrs && node.attrs.class == 'nickname' && node.attrs.user_id) {
        // 保护用户昵称，移除。客户端将通过 node.attrs.user_id，获取用户昵称
        delete node.children
        callUid.push(node.attrs.user_id)
      }
    }
    if (callUid.length) {
      msgData.call_uid = callUid
    }
  } else if (type === 'order') {
    // 发送订单消息时，需要 call 此订单的用户
    msgData.call_uid = [msgData.body.user_id]
  }

  // 创建新会话或者更新已有会话。
  // 拿到消息接收者的 isMute 状态（仅私聊有效）
  let {isMute,groupInfo} = await _createOrUpdateConversation.call(this, conversation_id, msgData, params.chat_source)
  // console.log({
  // 	...msgData,
  // 	conversation_id
  // });

  // 如果是扩展的消息类型，由扩展模块决定是否要保存入库
  let noPersistent = false
  const { msgTypes } = require('uni-im-ext')
  let msgType = await msgTypes.get(type)
  if (msgType && msgType.noPersistent) {
    noPersistent = msgType.noPersistent(msgData)
  }

  // todo:临时增加私有代码逻辑，后续会迁移到扩展模块中
  if (
		type === 'system' && action === 'set-group-member-ext-plugin-order-info'
		||
		msgData.noSaveToDB
	) {
    // 群成员设置插件排序信息，不需要保存至数据库
    noPersistent = true
  }

  // 如果是无需保存至数据库的消息，因缺失 _id ，将影响客户端对该消息接收状态的判断，所以这里需要创建临时 _id
  if (noPersistent) {
    msgData._id = 'temp_' + Math.random().toString(36).substr(2) + Date.now()
  }
  // 将消息内容存到数据库，“点击重发按钮的”和“不需要保存的扩展消息”除外
  else if (!isRetries || !msgData._id) {
    const __text = _extractTextFromMsg(msgData)
    if (__text) {
      msgData.__text = __text
      // console.log(' msgData.__text', msgData.__text);
    }

    let res = await dbUniImMsg.add({
      ...msgData,
      conversation_id
    })

    msgData._id = res.id
    // console.error('uni-im-msg msgData:',msgData, res);

    // 调用扩展点 send-msg
    // 这里需要 clone，因为是异步调用，而下面的代码马上就要修改 msgData
    let { ...clonedMsg } = msgData
    this.addPromise(invokeExts('send-msg', clonedMsg, this))

    // 客户端不需要返回__text 字段
    delete msgData.__text
  } else {
    // console.error('跳过添加 msg 到数据库！～～～～～～～～～')
  }

  // 不可见/静音消息一定是 isMute
  if (!_isReadableMsg(msgData) || msgData.is_mute) {
    isMute = true
  }

  // 处理产生的推送
  let res = await _processPush.call(this, {msgData,isMute,appId,groupInfo})

  if (!res.data) {
    res.data = {}
  }

  // 返回云端消息记录创建的时间
  res.data.create_time = msgData.create_time
  // 返回云端消息记录的 id
  res.data._id = msgData._id
  return res
}


// 执行发送消息前的操作
async function _beforeSendMsgActions(params) {
  if (params.type === 'revoke_msg') {
    let res = await _revokeMsg.call(this, params.body.msg_id)
    let {
      appid,
      group_id,
      to_uid
    } = res
    params.appId = appid
    params.group_id = group_id
    params.to_uid = to_uid
    return
  }

  // 如果是扩展的消息类型，由扩展模块执行前置操作
  const { msgTypes } = require('uni-im-ext')
  let msgType = await msgTypes.get(params.type)
  if (msgType && msgType.beforeSendMsg) {
    await msgType.beforeSendMsg(params, this.current_uid)
    console.error('############----->beforeSendMsg', params)
    return
  }
}

async function _checkConversationGrade({
  from_uid,
  to_uid,
  group_id,
}) {
  if(!conversation_grade){
    return true
  }
  /** 读取配置的对话等级，校验是否有权发送消息
   * 	0	-	任何人可以发起会话
   *	100	-	客服 or 好友或者群成员
   *	200	-	必须是好友或者群成员
   *  300 -  仅限：系统管理员参与的、群成员与群管理员，发起私聊
   **/
  switch (conversation_grade) {
    case 100:
      // 客服 or 好友或者群成员
      try {
        await chatToCustomerService()
      } catch (error) {
        console.error(error)
        await chatToFriendOrGroupMember()
      }
      break;
    case 200:
      // 必须是好友或者群成员
      await chatToFriendOrGroupMember()
      break;
    case 300:
      // 放到创建会话时处理
      break;
    default:
      throw new Error('未知的对话等级,配置conversation_grade的值不正确')
      break;
  }
  // 客服模式下，如果配置的客服 id。则只能向客服发起会话
  async function chatToCustomerService (){
    const customer_service_uids = uniImConfig.config('customer_service_uids') || []
    if (typeof customer_service_uids == 'string') {
      customer_service_uids = [customer_service_uids]
    }
    if (
      !(customer_service_uids.includes(from_uid) || customer_service_uids.includes(to_uid))
    ) {
      throw new Error('非法通讯，会话双方用户 id，均不属于 uni-im-co 中配置的 customer_service_uids')
    }
    return true
  }
  
  // 只能是好友关系，或者群成员才能发送
  async function chatToFriendOrGroupMember(){
    if (group_id) {
      let {
        data: [has]
      } = await dbUniImGroupMember
        .where({
          group_id,
          user_id: this.current_uid
        })
        .get()
      if (!has) {
        throw new Error('非群成员不能发起会话')
      }
    }
    if (to_uid) {
      let {
        data: [has]
      } = await dbUniImFriend
        .where({
          friend_uid: to_uid,
          user_id: this.current_uid
        })
        .get()
      if (!has) {
        throw new Error('非好友不能发起会话')
      }
    }
    return true
  }
}

function _getLastMsgNote({
  body,
  type,
  action,
}) {
  // 文本 => 文本的前 30 个字
  // 其他 => 消息类型
  let last_msg_note = '[多媒体]'
  if (type == 'text') {
    last_msg_note = body.toString()
    last_msg_note = last_msg_note.replace(/[\r\n]/g, "");
    last_msg_note = last_msg_note.slice(0, 30)
  } else if (type === 'userinfo-card') {
    last_msg_note = `${body.name} 的名片`
  } else if (type === 'system') {
    switch (action) {
      case 'group-join':
        last_msg_note = '加入群聊'
        break;
      case 'group-exit':
        last_msg_note = '退出群聊'
        break;
      case 'group-expel':
        last_msg_note = '被踢出群聊'
        break;
      default:
        // 更新群资料
        if (action.includes("update-group-info-")) {
          const { fieldsName } = body;
          last_msg_note = `[${fieldsName + '更新'}]`;
        }
        break;
    }
  } else {
    last_msg_note = {
      image: "[图片]",
      sound: "语音",
      video: "[视频]",
      file: "[文件]",
      location: "[位置]",
      system: "[系统消息]",
      code: "[代码]",
      'rich-text': "[图文消息]",
    } [type] || `[${type}]`
  }
  return last_msg_note
}

async function _createOrUpdateConversation(conversation_id, msgData, chat_source) {
  // 设置会话 最后一条消息 的描述
  let last_msg_note = _getLastMsgNote(msgData)
  // 查询群信息
  let groupInfo;
  if (msgData.group_id) {
    const res = await db.collection('uni-im-group')
      .doc(msgData.group_id)
      .field({
        type: true,
        name: true
      })
      .get()
    console.error('groupInfo------', res.data[0]);
    groupInfo = res.data[0]
  }
  

  // 查询当前用户的此会话
  const {
    data: conversationList
  } = await dbUniImConversation
    .where(
      dbCmd.and([
        { id: conversation_id },
        dbCmd.or([
          { user_id: msgData.from_uid },
          { group_id: dbCmd.exists(false) }
        ])
      ])
    )
    .get()
  // console.log('conversation', conversation);
  // 消息发送者的会话
  let senderConversation = conversationList.find(item => item.user_id == msgData.from_uid)
  // 消息接收者的会话（此数据仅私聊时存在）
  let receiverConversation = conversationList.find(item => item.user_id == msgData.to_uid)
  const isMute = (receiverConversation ? receiverConversation.mute : false)
  if (msgData.type === 'read_msg'){
    // todo:临时方案，拦截已读动作更新会话
   // console.error('已读动作无需更新会话') 
  }
  // 不存在，需要先创建会话记录
  else if (!senderConversation) {
    // 除了云函数之间（包括触发器）调用 和 特殊角色用户，需验证是否绑定了手机号码
    const check_mobile = uniImConfig.config('check_mobile')
    if (
      check_mobile &&
      this.getClientInfo().source != 'function' &&
      !this.current_user_role.includes('uni-im-admin') &&
      !this.current_user_role.includes('staff')
    ) {
      // 验证账号是否绑定了手机号
      let getUserInfoRes = await db.collection('uni-id-users')
        .doc(this.current_uid)
        .field({
          mobile_confirmed: 1
        })
        .get()
      if (!getUserInfoRes.data[0].mobile_confirmed) {
        throw new Error('账号未绑定手机号无法发送消息，请完成绑定后退出并重新登录本系统后重试。')
      }
    }
    const clientInfo = this.getClientInfo()
    if( conversation_grade === 300 && msgData.to_uid && clientInfo.source != 'function' && this.current_uid != 'system'){
      // 仅限：系统管理员参与的 或 群成员向群管理员 发起私聊
      let check = false
      // 消息发送者是系统管理员
      if (this.current_user_role.includes('staff')) {
        check = true
        // console.error('createOrUpdateConversation staff~~~~~');
      } else if (chat_source && chat_source.group_id) {
        // console.error('createOrUpdateConversation group_id~~~~~');
        // 临时会话来源群，判断双方是否有一个是群管理员
        let {
          data: [member],
        } = await dbUniImGroupMember
          .where({
            group_id: chat_source.group_id,
            user_id: dbCmd.in([msgData.from_uid, msgData.to_uid]),
            role: dbCmd.in(['admin'])
          })
          .get()
        if (member) {
          check = true
          // console.error('createOrUpdateConversation member~~~~~', member);
        }
      } else {
        // 判断消息接收者是否为系统管理员（staff）
        let {
          data: [receiver],
        } = await db.collection('uni-id-users')
          .doc(msgData.to_uid)
          .field({
            role: 1,
            nickname: 1,
            avatar_file: 1,
          })
          .get()
        // console.error('createOrUpdateConversation receiver~~~~~', receiver);
        if (receiver && receiver.role && receiver.role.includes('staff')) {
          // console.error('createOrUpdateConversation receiver.staff~~~~~');
          check = true
        }
      }

      if (!check) {
        let {
          data: [has]
        } = await dbUniImFriend
          .where({
            friend_uid: msgData.to_uid,
            user_id: this.current_uid
          })
          .get()
        if (has) {
          check = true
        }
      }

      if (!check) {
        throw new Error('仅限：好友之间、系统管理员参与的、群成员与群管理员，发起私聊')
      }
    }

    // 1.消息发送者 会话数据
    senderConversation = {
      id: conversation_id,
      type: msgData.group_id ? 2 : 1,
      user_id: msgData.from_uid,
      friend_uid: msgData.to_uid,
      group_id: msgData.group_id,
      unread_count: 0,
      last_msg_note,
      update_time: msgData.create_time,
      create_time: msgData.create_time,
      last_msg_create_time: msgData.create_time,
      pinned: false,
      hidden: false,
      mute: false
    }
    if (msgData.group_id) {
      senderConversation.leave = false
      senderConversation.has_unread_group_notification = null
      senderConversation.group_type = groupInfo.type
      // 群聊只为当前用户创建会话
      await dbUniImConversation.add(senderConversation)
    } else {
      const newConversation = [senderConversation]
      // 如果不是：用户自己给自己发消息
      if (msgData.to_uid != msgData.from_uid) {
        // 2.消息接收者 会话数据
        receiverConversation = {
          ...senderConversation,
          unread_count: 1,
          user_id: msgData.to_uid,
          friend_uid: msgData.from_uid
        }
        newConversation.push(receiverConversation)
      }
      await dbUniImConversation.add(newConversation)
    }
  } else {
    // 会话已存在，更新相关内容
    let updateObj = {
      last_msg_note,
      update_time: msgData.create_time,
      hidden: false
    }

    // 如果不是：用户自己给自己发消息，则需要增加未读消息数
    if (msgData.from_uid != msgData.to_uid) {
      updateObj.unread_count = dbCmd.inc(1)
    }

    // TODO：部分情况下不需要更新未读消息数，后续会改成都通过is_mute字段来判断
    if (
      // 加群消息
      msgData.action === "join-group"
      ||
      // 禁言通知
      msgData.action === 'update-group-info-mute_all_members'
      ||
      // 本身是一条静默消息
      msgData.is_mute === true
    ) {
      delete updateObj.unread_count
    }
    
    if (!(await _isReadableMsg(msgData))) {
      // “非可见消息”不更新“最后一次对话消息概述”
      delete updateObj.last_msg_note
    }
    if (_isMuteMsg(msgData) || !(await _isReadableMsg(msgData))) {
      // “静音消息”不更新“未读消息数”
      delete updateObj.unread_count
    }
    
    // 如果有last_msg_note，增加一个last_msg_create_time字段
    if (updateObj.last_msg_note) {
      updateObj.last_msg_create_time = msgData.create_time
    }

    // 所有接收者的会话表更新
    let res = await dbUniImConversation
      .where({
        id: conversation_id,
        user_id: dbCmd.neq(msgData.from_uid),
        leave: dbCmd.neq(true)
      })
      .update(updateObj)
    // console.log(res);

    // 更新发送者的会话（ 发送者的消息未读数不需要 +1 ）
    delete updateObj.unread_count
    res = await dbUniImConversation
      .where({
        id: conversation_id,
        user_id: msgData.from_uid
      })
      .update(updateObj)
    // console.log(res);
  }

  // 返回消息接收者的isMute状态（仅私聊有效）
  return {
    isMute,
    groupInfo
  }
}

function _extractTextFromMsg(msgData) {
    let __text = null
    if (["text", "code"].includes(msgData.type)) {
        __text = msgData.body.replace(/[\s\n]+/g, " ")
    } else if (["image", "video", "file"].includes(msgData.type)) {
        __text = msgData.body.name
    } else if (msgData.type == "rich-text") {
        let getTextOfNodeList = (nodesList) => {
            let text = ''
            nodesList.forEach(item => {
                if (item.type == "text") {
                    text += item.text
                }
                if (Array.isArray(item.children)) {
                    text += " " + getTextOfNodeList(item.children)
                    if (item.attrs && item.attrs.class === 'nickname') {
                        // 增加空格，用于区分昵称和消息内容
                        text += " "
                    }
                }
            })
            return text
        }
        __text = getTextOfNodeList(msgData.body).replace(/[\s\n]+/g, " ")
    }

    if (__text) {
        // 全部转成小写，以便进行大小写不敏感的匹配
        __text = __text.toLowerCase()
        // 24 位 hex 会被 mongodb 自动转换成 ObjectId，需阻止
        if (__text.match(/^[0-9a-f]{24}$/)) {
            __text = __text + ' '
        }
    }

    return __text
}

function _checkForLongMsg(msgData) {
    let bodyStr = JSON.stringify(msgData.body)
    if (bodyStr > 50000) {
        throw new Error('单次消息最长字符长度不得超过 50000')
    }
    if (bodyStr.length > 250) {
        switch (msgData.type) {
            case 'rich-text':
                msgData.body = "富文本消息"
                break;
            case 'history':
                msgData.body = "转发的聊天记录"
                break;
            case 'text':
                // 截断，但标识消息为长文本消息，客户端收到此标识，会从数据库中拉取完整消息内容
                msgData.body = msgData.body.slice(0, 50)
                break;
            default:
                msgData.body = `[${msgData.type}]类型消息`
                break;
        }

        msgData.LongMsg = true
    }
}

async function _checkForReplyMsg(msgData) {
    if (!msgData.about_msg_id) return

    let { 
    data: [aboutMsg]
    } = await dbUniImMsg.doc(msgData.about_msg_id).get()
    if (!aboutMsg) {
        throw new Error('方法的 about_msg_id')
    }
    if (!Array.isArray(msgData.call_uid)) {
        msgData.call_uid = []
    }
    msgData.call_uid.push(aboutMsg.from_uid)
    // console.log(987,aboutMsg,msgData.call_uid);
}

async function _processPush({ msgData, isMute, appId,groupInfo }) {
    // 处理超长文本，push 发送不了的问题
    _checkForLongMsg(msgData)

    // 处理 消息回复 @某人的
    await _checkForReplyMsg(msgData)
		
		// 给被at的会话打上标记 has_unread_call_you_msg = true
		if (msgData.call_uid && msgData.call_uid.length > 0) {
			this.addPromise(
				dbUniImConversation
					.where({
						id: msgData.conversation_id,
						user_id: dbCmd.in(msgData.call_uid)
					})
					.update({
						remind_msg_ids: dbCmd.push(msgData._id)
					})
			)
		}
			
			

    const { nickname, avatar_file } = msgData
    let title
    let content
    if(groupInfo){
      title = groupInfo.name
      content = nickname.slice(0, 20) + '：' + (msgData.type == 'text'? msgData.body : '[多媒体]')
    }else{
      title = msgData.type == 'system'? '系统消息' : nickname.slice(0, 20)
      content = msgData.type == 'text'? msgData.body : '[多媒体]'
    }
    // 定义推送参数
    const pushParam = {
        payload: {
            type: "uni-im",
            data: msgData,
            title, // "收到 im 消息，在线时显示的标题",
            content, // "在线时显示的副标题",
            avatar_file, // 头像文件对象,
            device_id: this.clientInfo.deviceId // 发送消息的设备（客户端）id，阻止当前用户收到自己发的消息
        },
        title: title.slice(0, 20), // "收到 im 消息，离线时显示的标题",
        content: content.slice(0, 50) //"离线时显示的内容"
    }

    let res

    if (msgData.from_uid!= 'system' && (msgData.to_uid || msgData.group_id)) {
        // 以"非离线"且免打扰的消息（避免系统通知栏出现消息）同步给当前用户的其他设备（比如 web 和 app、小程序同时登录时；注：发送此消息的“设备”在客户端通过业务代码过滤，这里不排除）
        this.addPromise(
            this.sendPushMsg({
               ...pushParam,
                user_id: msgData.from_uid,
                settings: {
                    strategy: {
                        default: 3
                    }
                }
            }, appId)
        )
    }

    if (msgData.to_uid) {
        // WS 推送：单聊消息推送给接收方
        if (!isMute &&!_isMuteMsg(msgData) && (await _isReadableMsg(msgData))) {
          this.addPromise(
            new Promise(resolve => {
							try {
								// 给500毫秒时间，确保请求大概率能发出去，但不接收响应，防止请求异常导致的等待时间过长
								invokeExts('push-msg-notify', {
								  to_uids: [msgData.to_uid],
								  msg: {
								    type: 'incr-conversation',
								    conversation_id: msgData.conversation_id,
								  }
								})
							} catch (error) {
								console.error('push-msg-notify error', error)
							}
              setTimeout(()=>{
                resolve()
              }, 500)
            })
          )
        }

        // 单聊，直接调用 before 中封装好的消息推送方法
        pushParam.user_id = msgData.to_uid
        if (isMute) {
            console.log('消息接收者设置了免打扰，或本身就是一条静音消息，应用离线时，此消息不会有系统通知')
            pushParam.settings = {
                strategy: {
                    default: 3
                }
            }
        }
        res = await this.sendPushMsg(pushParam, appId)
        // console.log('sendMessage', JSON.stringify(res))
        /*
        //判断是否已经有客户端接收到消息，注意：收到不等于已读
        let taskData = res.data[Object.keys(res.data)]
        let state = false;
        for (let key in taskData) {
            if (taskData[key] == 'successed_online') {
                state = true
                break
            }
        }
        console.log('state : ============> ' + state);*/
        res.data = {} // 不返回给客户端发送结果
    } else if (msgData.group_id) {
        this.addPromise(
            // 把当前发消息的用户的，在群成员中的活跃时间更新
            db.collection('uni-im-group-member').where({
                group_id: msgData.group_id,
                user_id: msgData.from_uid
            }).update({
                active_time: Date.now()
            })
        )

        // 如果是群聊则调用 sendMsgToGroup 云方法，此方法内部会递归发送（500 个为用户一批）
        if (this.getClientInfo().clientIP == "127.0.0.1") {
            // 如果是本地调试，直接 await 调用（因为本地调试下，云函数互调“不是调用新实例”，必须等待执行结束，注：相比生产环境的速度会更慢。）
            const start = Date.now() // 计时
            let sendMsgToGroupRes = await sendMsgToGroup()
            console.error(
                'sendMsgToGroupRes', sendMsgToGroupRes,
                'sendMsgToGroup 耗时：', Date.now() - start, 'ms',
                '因为本地调试下，云函数互调“不是调用新实例”，必须等待执行结束，注：相比生产环境的速度会更慢。'
            )
        } else {
            sendMsgToGroup()
            // 等待 500 毫秒，给一个请求发出去的时间
            this.addPromise(
                new Promise(resolve => {
                    setTimeout(resolve, 500)
                })
            )
        }
        function sendMsgToGroup() {
            return uniCloud.importObject('uni-im-co').sendMsgToGroup({
                pushParam,
                appId
            })
        }
        res = {
            errCode: 0
        }
    } else {
        throw new Error('接受者标识，不能为空')
    }
    return res
}

async function sendMsgToGroup({
    pushParam,
    before_id,
    push_clientids = [],
    member = [],
    appId,
    // 默认先给未设置消息免打扰的用户发消息
    mute = false
}) {
    // 注意：这是一个递归云对象，用递归的方式处理批量任务
    const limit = 1000
    if (this.getClientInfo().source!= 'function') {
        return {
            errSubject: 'uni-im-co',
            errCode: 0,
            errMsg: '该方法仅支持云对象的方法，或者触发器调用'
        }
    }

    // console.log('sendMsgToGroup=========', {
    // 	pushParam,
    // 	before_id,
    // 	push_clientids
    // });

    if (before_id || push_clientids) {
        // console.log({
        // 	before_id,
        // 	push_clientids
        // });
        // return 123
    }

    if (push_clientids.length === 0) {
        // console.log('开始查库', push_clientids.length, push_clientids);
        let group_id = pushParam.payload.data.group_id
        if (!group_id) {
            throw new Error('群 id 不能为空')
        }
        let getMemberwhere = {
            group_id,
            mute: mute? true : dbCmd.neq(true),
            leave: dbCmd.neq(true),
            // 需要排除自己
            user_id: dbCmd.neq(pushParam.payload.data.from_uid)
        }

        if (before_id) {
            getMemberwhere._id = dbCmd.gt(before_id)
        }
        // console.log({
        // 	getMemberwhere
        // });
				/*
        let res = await dbUniImConversation
           .aggregate()
           .match(getMemberwhere)
           .sort({
                _id: 1
            })
           .limit(limit)
           .project({
                user_id: 1,
                mute: 1
            })
           .lookup({
                from: "uni-id-device",
                let: {
                    user_id: '$user_id'
                },
                pipeline: $.pipeline()
                   .match(
                        dbCmd.expr(
                            $.and([
                                $.eq(['$user_id', '$$user_id']),
                                $.gt(['$token_expired', Date.now()])
                            ])
                        )
                    ).project({
                        push_clientid: 1
                    })
                   .done(),
                as: 'push_clientids',
            })
           .end()
				*/
			 let res = await dbUniImConversation
			    .where(getMemberwhere)
					.orderBy("_id", "asc")
			    .limit(limit)
					.field({
						user_id: 1,
						mute: 1
			    })
					.get()
				let getDeviceRes = await db.collection('uni-id-device')
						.where({
							user_id: dbCmd.in(res.data.map(item => item.user_id)),
							token_expired: dbCmd.gt(Date.now())
						})
						.field({
							push_clientid: true,
							user_id: true,
						})
						.limit(10000)
						.get()
				const deviceObj = getDeviceRes.data.reduce((acc, cur) => {
					if (!acc[cur.user_id]) {
						acc[cur.user_id] = []
					}
					acc[cur.user_id].push(cur)
					return acc
				}, {})
				res.data.forEach(item => {
					item.push_clientids = deviceObj[item.user_id] || []
				})
				// console.error('res.data----------',res.data)
				
        member = res.data
        console.error('符合条件的' + (mute? '【设置消息免打扰的用户】' : '') + '用户数', member.length); //,member
        push_clientids = member.reduce((sum, item) => {
            sum.push(...item.push_clientids.map(i => i.push_clientid))
            return sum
        }, [])
        console.log('查到需要接收消息的设备数：', push_clientids.length);

        // 消息接收者用户 id
        const receiverUids = member.map(user => user.user_id)
        const msgData = pushParam.payload.data

        // console.error('###########msgData.action', msgData.action);
        // 更新：退群、解散群、被踢出群 相关的用户会话
        if (receiverUids.length && ["group-exit", "group-expel", "group-dissolved"].includes(msgData.action)) {
            const updateUids = []
            if (['group-exit', 'group-expel'].includes(msgData.action)) {
                // 主动退群/被踢出群 时，仅退群用户所在“消息推送批次”时更新会话即可
                msgData.body.user_id_list.forEach(uid => {
                    if (receiverUids.includes(uid)) {
                        updateUids.push(uid)
                    }
                })
            } else {
                // 群解散时，所有“本批次”的用户会话都需要更新（注：分批 解散/退出群 的设计模式）
                updateUids.push(...receiverUids)
                // 解散群时，在第一批次时，增加更新操作者（群主）的会话
                if (!before_id) {
                    updateUids.push(msgData.from_uid)
                }
            }

            if (updateUids.length) {
                let res = await dbUniImConversation
                   .where({
                        id: msgData.conversation_id,
                        user_id: dbCmd.in(updateUids)
                    })
                   .update({ "leave": true })
                // console.error('###########更新退群或者被踢出群的用户会话', res,updateUids);
            }
        }

        // WS 推送：群聊消息推送给相关用户
        if (!mute &&!_isMuteMsg(msgData) && (await _isReadableMsg(msgData))) {
            // 启动一个云对象来完成推送操作
            uniCloud.importObject('uni-im-co').pushWsMsgNotifyOnNewThread({
                to_uids: receiverUids,
                msg: {
                  type: 'incr-conversation',
                  conversation_id: msgData.conversation_id,
                }
            }, appId)
            // 等待 500 毫秒，给一个请求发出去的时间
            this.addPromise(
                new Promise(resolve => {
                    setTimeout(resolve, 500)
                })
            )
        }
    } else {
        console.log('不需要查库，继续发送任务', push_clientids.length);
    }

    if (push_clientids.length === 0) {
        if (mute) {
            // console.log('已没有设置了免打扰的用户需要接收消息');
            return {
                errCode: 0,
                errMsg: '',
            }
        } else {
            // console.log('已没有未设置免打扰的用户需要接收消息，继续查询设置免打扰的用户');
        }
    }

    // 下一批推送的设备 id
    let next_push_clientids = push_clientids.slice(limit)
    // 当前这一批要推送的设备 id
    push_clientids = push_clientids.slice(0, limit)
    if (push_clientids.length > 0) {
        pushParam.push_clientid = push_clientids
        // console.log("pushParam", pushParam);
        // 如果是给免打扰的用户发消息，需要设置策略，只通过个推通道下发，不考虑设备是否在线
        if (mute || pushParam.payload.data.is_mute) {
            pushParam.settings = {
                strategy: {
                    default: 3
                }
            }
        }
        // 执行推送
        let sendPushMsgRes = await this.sendPushMsg(pushParam, appId)
        // console.error(sendPushMsgRes)
    }

    if (next_push_clientids.length!== 0) {
        // 发起下一批数据的推送
        uniCloud.importObject('uni-im-co').sendMsgToGroup({
            pushParam,
            push_clientids: next_push_clientids,
            member,
            mute
        }, appId)
        // 等待 500 毫秒，给一个请求发出去的时间
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    errCode: 0,
                    errMsg: ''
                })
            }, 500)
        })
    } else if (member.length == limit) {
        // 成员数等于分页数，则处于递归翻页进行中，且当前批次的数据已经全部推送完毕，继续查询下一批数据
        // console.log('member---*--*', member);
        before_id = member[member.length - 1]._id
        uniCloud.importObject('uni-im-co').sendMsgToGroup({
            pushParam,
            before_id,
            mute
        }, appId)
        // 等待 500 毫秒，给一个请求发出去的时间
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    errCode: 0,
                    errMsg: ''
                })
            }, 500)
        })
    } else {
        if (!mute) {
            // 如果之前不是给设置了免打扰的用户发消息，接下来需要给设置了免打扰的用户发消息
            uniCloud.importObject('uni-im-co').sendMsgToGroup({
                pushParam,
                mute: true
            }, appId)
            // 等待 500 毫秒，给一个请求发出去的时间
            return await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        errCode: 0,
                        errMsg: ''
                    })
                }, 500)
            })
        } else {
            // console.log('没有更多用户需要接收消息');
            return {
                errCode: 0,
                errMsg: ''
            }
        }
    }
}

async function pushWsMsgNotifyOnNewThread({
    to_uids,
    msg
}) {
  let t0 = Date.now()
  console.log('pushWsMsgNotifyOnNewThread: start')
  await invokeExts('push-msg-notify', { to_uids, msg })
  console.log('pushWsMsgNotifyOnNewThread: end:', Date.now() - t0)
}

async function getMsgList({
    conversation_ids,
    minUpdateTime,
    limit
}) {
    // 校验 conversation_ids 是否为当前用户
    let {
      data: conversationList
    } = await dbUniImConversation.where({
        id: dbCmd.in(conversation_ids),
        user_id: this.current_uid,
        leave: dbCmd.neq(true)
    }).get()
    if (conversationList.length!== conversation_ids.length) {
        throw new Error('无效的会话 id')
    }

    // 查询消息列表
    let res = await dbUniImMsg.where({
        conversation_id: dbCmd.in(conversation_ids),
        update_time: dbCmd.gt(minUpdateTime)
    })
    .orderBy('update_time', 'asc')
    .limit(limit)
    .get()

    return res
}

async function _revokeMsg(msgId) {
    //1. 先查到这条消息
    let {
      data: [msgData]
    } = await dbUniImMsg.doc(msgId).get()
    if (!msgData) {
        throw new Error('无效的消息 id')
    }
    // 如果不是 im 产品的管理员
    if (!this.current_user_role.includes('uni-im-admin') && this.getClientInfo().source!= 'function') {
        let {
          conversation_id,
          from_uid,
          appid: appId,
          group_id,
          create_time
        } = msgData

        // 判断是不是群主
        let isGroupAdmin = false
        if (group_id) {
            let res = await dbUniImGroupMember
            .where({
                group_id,
                user_id: this.current_uid
            })
            .get()
            let role = res.data[0].role || []
            isGroupAdmin = res.data[0] && role.includes('admin')
        }
        // console.error('isGroupAdmin',isGroupAdmin)

        // 如果不是群主，且消息不是发送者的就无权撤回
        if (!isGroupAdmin) {
            if (from_uid!= this.current_uid) {
                throw new Error('你不是消息的发送者或群管理员，无权操作')
            } else {
                // 消息发送者为“当前用户”时，消息创建时间需要时间小于 2 分钟
                if (Date.now() - create_time > 1000 * 60 * 2) {
                    throw {
                        errSubject: 'uni-im-co',
                        errCode: 10004,
                        errMsg: '消息已超过 2 分钟不能撤回'
                    }
                }
            }
        }
    }

    // 改变云数据库中此消息的撤回状态
    let res = await dbUniImMsg
    .doc(msgId)
    .update({
        is_revoke: true,
        update_time: Date.now()
    })
    return msgData
}

function _isMuteMsg(msg) {
    return (
        // 加群消息
        msg.action === "join-group"
        ||
        // 禁言通知
        msg.action === 'update-group-info-mute_all_members'
        ||
        // 消息本身是静默消息
        msg.is_mute === true
    )
}

async function _isReadableMsg(msg) {
		if( 
			['revoke_msg', 'clear-conversation-unreadCount'].includes(msg.type) ||
			['update-group-info-avatar_file', 'update-conversation-info'].includes(msg.action)		
		){
			 return false
		}

    // 如果是扩展的消息类型，由扩展模块决定消息是否可见
    const { msgTypes } = require('uni-im-ext')
    const msgTypesGetSatrt = Date.now()
    let msgType = await msgTypes.get(msg.type)
    // console.error('msgTypes.get', Date.now() - msgTypesGetSatrt)
    if (msgType && msgType.isReadable) {
        return msgType.isReadable(msg)
    }

    return true
}

module.exports = {
    sendMsg,
    sendMsgToGroup,
    pushWsMsgNotifyOnNewThread,
    getMsgList
}