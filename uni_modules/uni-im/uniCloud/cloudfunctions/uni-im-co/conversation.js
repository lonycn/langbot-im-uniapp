const {
  db,
  dbCmd,
  $,
} = require('uni-im-utils')

// 获取会话列表
async function getConversationList({
  // 会话条数
  limit = 15,
  // 跳过的会话条数，主要用于跳过会话更新时间相等的会话
  skip = 0,
  // 最大的会话的最后一条消息的创建时间
  maxLastMsgCreateTime = false,
  // 最大的会话更新时间
  maxUpdateTime = false,
  // 最小的会话更新时间
  minUpdateTime = false,
  // 不为false则表示获取指定的会话
  conversation_id = false,
  // 是否要区分是否为置顶
  distinguishPinned = false,
  // 群id
  group_id = false,
  sort = {
    pinned: -1,
    last_msg_create_time: -1,
    _id: -1
  },
  type = false
}) {
  
  let matchObj = {
    // 限制只能查询当前用户自己的会话记录
    user_id: this.current_uid,
    // group_id: dbCmd.exists(false), //是否查询群聊会话
    // unread_count: dbCmd.gt(0)
  }
  if(type){
    const action = {
      unread: () => {
        matchObj.unread_count = dbCmd.gt(0)
      },
      group: () => {
        matchObj.group_id = dbCmd.exists(true)
      },
      single: () => {
        matchObj.friend_uid = dbCmd.exists(true)
      },
      todo: () => {
        matchObj.is_todo = dbCmd.exists(true)
      },
      is_star: () => {
        matchObj.is_star = dbCmd.exists(true)
      },
			has_remind_msg: () => {
				// 数组大于0
				matchObj.remind_msg_ids = dbCmd.exists(true)
			}
    }
    if(typeof type === 'object'){
      if(Object.keys(type)[0] === 'group_type'){
        matchObj.group_type = type.group_type
      }
    }else{
      action[type] && action[type]()
    }
    
    // console.error('action========',type,'group_type:'+matchObj.group_type);
  }
  
  // 如果指定了会话id，则只查询指定的会话
  if (conversation_id) {
    matchObj.id = conversation_id
  } else if (group_id) {
    matchObj.group_id = group_id
  }
  else {
    // 默认不查询置顶会话
    if (distinguishPinned) {
      matchObj.pinned = dbCmd.neq(true)
    }
    matchObj.leave = dbCmd.neq(true)
    matchObj.hidden = dbCmd.neq(true)
    
    if (maxUpdateTime) {
      sort = {
        pinned: -1,
        update_time: -1,
        _id: -1
      }
      if(skip){
        matchObj.update_time = dbCmd.lte(maxUpdateTime)
      }else{
        matchObj.update_time = dbCmd.lt(maxUpdateTime)
      }
    } else if (minUpdateTime) {
      sort = {
        pinned: -1,
        update_time: -1,
        _id: -1
      }
      matchObj.update_time = dbCmd.gt(minUpdateTime)
    } else if (maxLastMsgCreateTime) {
      if(skip){
        matchObj.last_msg_create_time = dbCmd.lte(maxLastMsgCreateTime)
      }else{
        matchObj.last_msg_create_time = dbCmd.lt(maxLastMsgCreateTime)
      }
    } else{
      if (distinguishPinned) {
        // 没有指定时间范围时(应用刚启动时第一次加载)，把所有置顶会话都查出来
        matchObj = dbCmd.or([
          {
            ...matchObj,
            pinned: true
          },
          matchObj
        ])
      }
    }
  }
  
  console.log('getConversationList matchObj', matchObj,sort,'limit：'+limit,'skip：'+skip);
  
  // 计算请求时间
  let startTime = Date.now()
  let res = await db.collection('uni-im-conversation').aggregate()
    .match(matchObj)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    // 联查获得最新的对话记录
    .lookup({
      from: "uni-im-msg",
      let: {
        id: '$id'
      },
      pipeline: $.pipeline()
        .match(dbCmd.expr($.eq(['$conversation_id', '$$id'])))
        .sort({update_time: -1})
        .limit(10)
        .project({
          __text: 0,
        })
        .done(),
      as: 'msgList'
    })
    // 联查获得对话的群信息
    .lookup({
      from: "uni-im-group",
      let: {
        group_id: '$group_id'
      },
      pipeline: $.pipeline()
        .match(
          dbCmd.expr($.eq(['$_id', '$$group_id']))
        )
        .project({
          user_id: 1,
          name: 1,
          introduction: 1,
          notification: 1,
          avatar_file: 1,
          join_option: 1,
          mute_all_members: 1,
          member_count: 1,
          type: 1,
          notification: 1,
          create_time: 1,
          update_time: 1,
          last_update_time: 1,
          ext: 1
        })
        .done(),
      as: 'group_info'
    })
    .end()
  // log请求时间
  // console.error('getConversationList耗时', Date.now() - startTime,startTime)
  
  // // 计时
  // startTime = Date.now()
  // // 查每个会话的最后一条消息
  // console.error('res.data',res.data,res.data.map(item => item.id));
  // let getLastVisibleMsgsRes = await uniCloud.database().collection('uni-im-msg')
  //                              .where({
  //                                conversation_id: dbCmd.in(res.data.map(item => item.id))
  //                              })
  //                              .orderBy('update_time', 'desc')
  //                              .limit(limit)
  //                              .get()
  // // log请求时间
  // console.error('getLastVisibleMsgsRes耗时', Date.now() - startTime,startTime)
  // let lastVisibleMsgs = {}
  // getLastVisibleMsgsRes.data.forEach(item => {
  //   lastVisibleMsgs[item.conversation_id] = item
  // })
  // console.error('lastVisibleMsgs',lastVisibleMsgs);
  // res.data.forEach(item => {
  //   item.last_visible_msg = lastVisibleMsgs[item.id]
  //   if (item.last_visible_msg) {
  //     if (item.last_visible_msg.is_revoke) {
  //       item.last_visible_msg.body = "消息已经被撤回"
  //     }
  //   }
  // })
  

  const dbJQL = uniCloud.databaseForJQL({
    clientInfo: this.clientInfo
  })
  let friend_uids = res.data.map(item => item.friend_uid).filter(i => i)
  // 计算请求时间
  startTime = Date.now()
  let usersInfoRes = {data:[]}
  if (friend_uids.length !== 0){
    usersInfoRes = await dbJQL.collection('uni-id-users')
      .where(`_id in ${JSON.stringify(friend_uids)}`)
			// 仅内部人员可见实名认证信息
      .field('_id,avatar_file,nickname' + (this.current_user_role && this.current_user_role.includes('staff') ? ',realname_auth' : ''))
      .limit(friend_uids.length)
      .get()
  }
  // log请求时间
  // console.error('get user耗时', Date.now() - startTime,startTime)
  
  // 计算请求时间
  startTime = Date.now()
  
  let usersInfoObj = {}
  usersInfoRes.data.forEach(item => {
    usersInfoObj[item._id] = item
  })

  res.data.forEach(item => {
    item.user_info = usersInfoObj[item.friend_uid]
    item.group_info = item.group_info[0]
    // 处理特殊情况
    item.msgList.map(msg => {
      if(msg.is_revoke){
        msg.body = '消息已经被撤回'
      }
			if( !(this.current_user_role && this.current_user_role.includes('staff')) ){
				// 非内部人员不可见，发送者ip
				msg.from_ip = false
			}
    })
  })
  
  // log请求时间
  // console.error('forEach user_info耗时', Date.now() - startTime,startTime)
  return {
    data: res.data,
    errCode: 0
  }
}

async function clearUnreadCount(){
  let res = await db.collection('uni-im-conversation').where({
    user_id: this.current_uid,
    unread_count: dbCmd.gt(0)
  }).update({
    unread_count: 0
  })
  console.error('clearUnreadCount',res);
  return {
    errCode: 0,
    data: res.updated
  }
}

async function removeRemindMsgId({
	conversation_id,
	msg_id
}){
	let res = await db.collection('uni-im-conversation').where({
		id: conversation_id,
		user_id: this.current_uid
	}).update({
		remind_msg_ids: dbCmd.pull(msg_id)
	})
	return {
		errCode: 0,
		data: res.updated
	}
}

module.exports = {
  getConversationList,
  clearUnreadCount,
	removeRemindMsgId
}
