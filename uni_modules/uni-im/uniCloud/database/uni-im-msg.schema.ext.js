// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
const TempGlobal = {}
module.exports = {
  trigger: {
    async beforeRead({
      clientInfo,
      where,
      userInfo,
      triggerContext
    }) {
      // console.log('where',where);
      const {
        conversation_id,
        to_uid
      } = where
      if (conversation_id || to_uid) {
        if (to_uid == userInfo.uid) {
          //查发给当前用户的数据
        } else if (conversation_id) {
          // console.log('conversation_id',conversation_id);
          const dbJQL = uniCloud.databaseForJQL({
            clientInfo,
            skipTrigger: true
          })

          //判断当前用户id是否有这个会话，否则无权接收此消息
          let {
            data: conversations
          } = await dbJQL.collection('uni-im-conversation')
            .where(`"id" == "${conversation_id}" && "user_id" == $cloudEnv_uid`)
            .get()
          // console.log('conversations',conversations);
          if (conversations.length === 0) {
            // 会话id无效（伪造的或者已经被移除群聊，所以会话被删）
            triggerContext.returnNull = true
            return
          }
        } else {
          throw new Error('uni-im-msg触发器：查询条件会话id或者to_uid错误')
        }
      } else {
        throw new Error('触发器限制了，查询条件必须包含会话id或者to_uid。如果要增加其他查询方式，请自己扩充')
      }
    },
    afterRead({ triggerContext, result, where, clientInfo, userInfo }) {
      if (triggerContext.returnNull === true) {
        result.data = []
      } else {
        result.data = result.data.map(item => {
          if (item.is_revoke) {
            item.body = '[消息已撤回]'
          }
					if( !(userInfo.role && userInfo.role.includes('staff')) ){
						// 非内部人员不可见，发送者ip
						item.from_ip = false
					}
          return item
        })
      }
    }
  }
}
