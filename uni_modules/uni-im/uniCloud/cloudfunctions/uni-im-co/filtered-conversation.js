const {
  db,
  dbCmd,
  $,
} = require('uni-im-utils')

/**
 * 根据给定的关键词查找匹配的会话：
 * 1. 单聊会话的对方昵称包含关键词。
 * 2. 群聊会话的群名包含关键词。
 * 3. 群聊会话中有聊天记录包含关键词。
 * 4. 查询所有@我的消息。
 */
async function getFilteredConversationList({
  keyword = '',
  limit = 30,
  timeLimit = false,
}) {
  let matchedFriends = await getSingleConversationsByFriendName.call(this, {keyword, limit, timeLimit})
  let matchedGroups = await getGroupConversationsByName.call(this, {keyword, limit, timeLimit})
  let matchedConversations = await getConversationsByMessage.call(this, {keyword, limit, timeLimit})

  return {
    errCode: 0,
		friends: matchedFriends,
		groups: matchedGroups,
		conversations: matchedConversations,
		// TODO:为了兼容旧版本，保留以下字段
		matchedFriends,
		matchedGroups,
		matchedConversations
  }
}

async function getSingleConversationsByFriendName({
  keyword = '',
  limit = 30,
  skip = Number.MAX_SAFE_INTEGER,
  timeLimit = false,
}) {
  // 缺省只看三个月之内的记录
  if (!timeLimit) {
    timeLimit = new Date().getTime() - 1000*60*60*24*92
  }

  // 先查出最多 1000 条单聊会话（圈定最终结果的范围）
  let { data: allConversations } = await db.collection('uni-im-conversation')
    .where({
      type: 1,
      user_id: this.current_uid,
      leave: dbCmd.neq(true),
      update_time: dbCmd.and(dbCmd.lt(skip), dbCmd.gt(timeLimit)),
    })
    .orderBy('update_time', 'desc')
    .limit(1000)
    .get()
  let ref_ids = allConversations.map(v => v.friend_uid)

  // 再查出对方昵称符合匹配的记录
  let re = new RegExp(keyword, 'i')
  let { data: matchedNames } = await db.collection('uni-id-users')
    .field({ nickname:1, email:1, avatar_file:1 })
    .where(dbCmd.and([
      {
        _id: dbCmd.in(ref_ids)
      },
      dbCmd.or([
        {
          nickname: re,
        },
        {
          nickname: dbCmd.exists(false),
          email: re,
        }
      ])
    ]))
    .orderBy('update_time', 'desc')
    .limit(1000)
    .get()
  let infos = matchedNames.reduce((infos, v) => {
    infos[v._id] = {
      title: v.nickname || v.email,
      avatar_file: v.avatar_file
    }
    return infos
  }, {})

  // 筛选出所有符合条件的会话
  let matchedConversations = allConversations
    .filter(v => infos[v.friend_uid])
    .map(v => ({ ...v, ...infos[v.friend_uid] }))
    .slice(0, limit + 1)

  let hasMore = matchedConversations.length > limit
  skip = hasMore ? matchedConversations.pop().update_time : 0

  return {
    errCode: 0,
    data: matchedConversations,
    skip,
    hasMore,
  }
}

async function getGroupConversationsByName({
  keyword = '',
  limit = 30,
  skip = Number.MAX_SAFE_INTEGER,
  timeLimit = false,
}) {
  // 缺省只看三个月之内的记录
  if (!timeLimit) {
    timeLimit = new Date().getTime() - 1000*60*60*24*92
  }

  // 先查出最多 1000 条群聊会话（圈定最终结果的范围）
  let { data: allConversations } = await db.collection('uni-im-conversation')
    .where({
      type: 2,
      user_id: this.current_uid,
      leave: dbCmd.neq(true),
      update_time: dbCmd.and(dbCmd.lt(skip), dbCmd.gt(timeLimit)),
    })
    .orderBy('update_time', 'desc')
    .limit(1000)
    .get()
  let ref_ids = allConversations.map(v => v.group_id)

  // 再查出群名称符合匹配的记录
  let { data: matchedNames } = await db.collection('uni-im-group')
    .field({ name:1, avatar_file:1 })
    .where({
      _id: dbCmd.in(ref_ids),
      name: new RegExp(keyword, 'i'),
    })
    .orderBy('update_time', 'desc')
    .limit(1000)
    .get()
  let infos = matchedNames.reduce((infos, v) => {
    infos[v._id] = {
      title: v.name,
      avatar_file: v.avatar_file,
    }
    return infos
  }, {})

  // 筛选出所有符合条件的会话
  let matchedConversations = allConversations
    .filter(v => infos[v.group_id])
    .map(v => ({ ...v, ...infos[v.group_id] }))
    .slice(0, limit + 1)

  let hasMore = matchedConversations.length > limit
  skip = hasMore ? matchedConversations.pop().update_time : 0

  return {
    errCode: 0,
    data: matchedConversations,
    skip,
    hasMore,
  }
}

async function getConversationsByMessage({
  keyword = '',
  limit = 30,
  skip = Number.MAX_SAFE_INTEGER,
  timeLimit = false,
}) {
  // 缺省只看三个月之内的记录
  if (!timeLimit) {
    timeLimit = new Date().getTime() - 1000*60*60*24*92
  }

  // 先查出最多 1000 条会话（圈定最终结果的范围）
  let { data: allConversations } = await db.collection('uni-im-conversation')
    .where({
      user_id: this.current_uid,
      leave: dbCmd.neq(true),
      update_time: dbCmd.gt(timeLimit),
    })
    .orderBy('update_time', 'desc')
    .limit(1000)
    .get()

  let infos = allConversations.reduce((infos, v) => {
    infos[v.id] = v
    return infos
  }, {})
  let conversation_ids = Object.keys(infos)

  // 再查出聊天记录符合匹配的记录
  let { data: matchedConversations } = await db.collection('uni-im-msg').aggregate()
    // 查找所有符合条件的消息记录
    .match({
      create_time: dbCmd.gt(timeLimit),
      conversation_id: dbCmd.in(conversation_ids),
      is_revoke: dbCmd.neq(true),
      __text: new RegExp(keyword.toLowerCase())
    })

    // 按会话分组计数
    .group({
      _id: '$conversation_id',
      message_time: $.max('$create_time'),
      count: $.sum(1)
    })

    // 分页
    .match({
      message_time: dbCmd.lt(skip),
    })
    .sort({
      message_time: -1
    })
    .limit(limit + 1)
    .end()

  let hasMore = matchedConversations.length > limit
  skip = hasMore ? matchedConversations.pop().message_time : 0
  matchedConversations = matchedConversations.map(v => ({ ...v, ...infos[v._id] }))

  // 补齐会话的 title 和 avatar
  infos = {}
  let ids = matchedConversations.filter(v => v.type == 1).map(v => v.friend_uid)
  if (ids.length > 0) {
    let { data } = await db.collection('uni-id-users')
      .field({ nickname:1, email:1, avatar_file:1 })
      .where({
        _id: dbCmd.in(ids)
      })
      .get()
    infos = data.reduce((infos, v) => {
      infos[v._id] = {
        title: v.nickname || v.email,
        avatar_file: v.avatar_file
      }
      return infos
    }, infos)
  }

  ids = matchedConversations.filter(v => v.type == 2).map(v => v.group_id)
  if (ids.length > 0) {
    let { data } = await db.collection('uni-im-group')
      .field({ name:1, avatar_file:1 })
      .where({
        _id: dbCmd.in(ids)
      })
      .get()
    infos = data.reduce((infos, v) => {
      infos[v._id] = {
        title: v.name,
        avatar_file: v.avatar_file
      }
      return infos
    }, infos)
  }
  
  matchedConversations = matchedConversations.map(v => ({
    ...v,
    ...infos[v.type == 1 ? v.friend_uid : v.group_id]
  }))

  return {
    errCode: 0,
    data: matchedConversations,
    skip,
    hasMore,
  }
}

/**
 * 根据给定的关键词获取一个会话中匹配的聊天记录。
 */
async function getFilteredMessageOfConversation({
  conversation_id,
  keyword = '',
  skip = Number.MAX_SAFE_INTEGER,
  limit = 30,
  minCreateTime = false,
}) {
  // 缺省只看三个月之内的聊天记录
  if (!minCreateTime) {
    minCreateTime = new Date().getTime() - 1000*60*60*24*92
  }
  
  // TODO: 检查当前用户访问指定 conversation 的合法性

  let { data } = await db.collection('uni-im-msg')
    .where({
        conversation_id,
        create_time: dbCmd.and(dbCmd.gt(minCreateTime), dbCmd.lt(skip)),
        is_revoke: dbCmd.neq(true),
        __text: new RegExp(keyword.toLowerCase()),
    })
    .orderBy('create_time', 'desc')
    .limit(limit + 1)
    .get()

  let hasMore = data.length > limit
  if (hasMore) data.pop()
  skip = data.length > 0 ? data[data.length - 1].create_time : 0

  return {
    errCode: 0,
    data,
    skip,
    hasMore,
  }
}

/**
 * 在一个会话内，根据给定的位置向前或向后查询聊天记录。
 */
async function getFragmentMessageOfConversation({
  conversation_id,
  skip = Number.MAX_SAFE_INTEGER,
  limit = 30,
  forward = false,
  minCreateTime = false,
}) {
  // 缺省只看三个月之内的聊天记录
  if (!minCreateTime) {
    minCreateTime = new Date().getTime() - 1000*60*60*24*92
  }
  
  // TODO: 检查当前用户访问指定 conversation 的合法性

  let { data } = await db.collection('uni-im-msg')
    .where({
        conversation_id,
        create_time: dbCmd.and(dbCmd.gt(minCreateTime), dbCmd[forward ? 'gt' : 'lt'](skip)),
        is_revoke: dbCmd.neq(true),
    })
    .orderBy('create_time', forward ? 'asc' : 'desc')
    .limit(limit + 1)
    .get()

  let hasMore = data.length > limit
  if (hasMore) data.pop()
  skip = data.length > 0 ? data[data.length - 1].create_time : 0

  return {
    errCode: 0,
    data,
    skip,
    hasMore,
  }
}

// 查询所有@我的消息
async function getConversationsByRemindMsg({
	skip = Number.MAX_SAFE_INTEGER,
	limit = 100,
	minCreateTime = false,
}={}){
  // 缺省只看三个月之内的聊天记录
  if (!minCreateTime) {
    minCreateTime = new Date().getTime() - 1000*60*60*24*92
  }
  
  // TODO: 检查当前用户访问指定 conversation 的合法性
  let { data: msgList } = await db.collection('uni-im-msg')
		.aggregate()
		.match({
        create_time: dbCmd.and(dbCmd.gt(minCreateTime), dbCmd.lt(skip)),
        is_revoke: dbCmd.neq(true),
        call_uid: this.current_uid
    })
		.lookup({
			from: 'uni-im-group',
			localField: 'group_id',
			foreignField: '_id',
			as: 'group'
		})
		.lookup({
			from: 'uni-id-users',
			localField: 'from_uid',
			foreignField: '_id',
			as: 'userInfo'
		})
    .sort({
      create_time: -1
    })
    .limit(limit + 1)
    .end()
		
	const dataList = msgList.map(msg => {
		const group = msg.group[0]
		const userInfo = msg.userInfo[0]
		delete msg.group
		delete msg.userInfo
		return {
			_id: msg.conversation_id,
			title: userInfo.nickname + (group ? `(${group.name})` : ''),
			msg,
			avatar_file: userInfo ? userInfo.avatar_file : group.avatar_file,
			type: group ? 2 : 1,
			create_time: msg.create_time
		}
	})
		

  let hasMore = dataList.length > limit
  if (hasMore) dataList.pop()
  skip = dataList.length > 0 ? dataList[dataList.length - 1].create_time : 0

  return {
    errCode: 0,
    data: dataList,
    skip,
    hasMore,
  }
}

module.exports = {
  getFilteredConversationList,
  getSingleConversationsByFriendName,
  getGroupConversationsByName,
  getConversationsByMessage,
  getFilteredMessageOfConversation,
  getFragmentMessageOfConversation,
	getConversationsByRemindMsg
}
