const { getConversationId } = require('uni-im-utils')

// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
module.exports = {
	trigger: {
		async beforeCreate({addDataList,userInfo}){
			// 如无特殊修改 此查库校验可以在，上线后删除 -- 调试专用
			if (addDataList.length === 1) {
				let [data] = addDataList
				let {user_id,friend_uid,group_id} = data
				let where = {user_id}
				if(friend_uid){
					where.friend_uid = friend_uid
				}else if(group_id){
					where.group_id = group_id
				}else{
					throw new Error('uni-im-conversation.schema.ext.js beforeCreate:friend_uid或group_id必传')
				}

				data.type = friend_uid ? 1:2
				const conversationId = getConversationId({
					from_uid: user_id,
					to_uid: friend_uid,
				})
				where.id = conversationId
				data.id = conversationId

				let res = await db.collection('uni-im-conversation')
						.where(where)
						.get()
				if(res.data.length){
					throw new Error('重复的会话记录')
				}
			} else {
				throw new Error('非法参数，触发器阻止了批量添加')
			}
		},
		async afterCreate({
			addDataList,
			clientInfo
		}) {
			if (addDataList.length === 1) {
				let [data] = addDataList
				let {user_id,friend_uid} = data
				data.user_id = friend_uid
				data.friend_uid = user_id
				let res = await db.collection('uni-im-conversation').add(data)
				// console.log(res,'同步添加会话');
			} else {
				throw new Error('非法参数')
			}
		},
		async beforeDelete({
			where
		}) {
		},
		async beforeUpdate({where,updateData,userInfo}){
      //只开放部分字段
      let canUpdateField = ["unread_count","pinned","hidden","mute","unread_group_notice_id","is_star"]
      Object.keys(updateData).forEach(field=>{
        if(!canUpdateField.includes(field)){
          throw new Error('uni-im-conversation.schema.ext.js beforeUpdate:限制只能更新的字段：'+canUpdateField.join('，'))
        }
      })
      //设置更新时间
      updateData.update_time = Date.now()

			// 用户设置自己的某个会话的未读消息数为0
			if(where.user_id == userInfo.uid && updateData.unread_count === 0){
        // 则设置此会话（发给当前用户）的消息 是否已读为 true
				let res = await db.collection('uni-im-msg').where({
					to_uid:userInfo.uid,
					conversation_id:where.id,
					is_read:false
				}).update({
					is_read:true
				})
				// console.log('uni-im-conversation beforeUpdate res:',res);
			}
		},
    async afterUpdate({updateData,where,userInfo,clientInfo,result}){
      // 用户设置自己的某个会话的未读消息数为0
      if(clientInfo.appVersionCode > 24030501 && where.user_id == userInfo.uid && updateData.unread_count === 0 && result.updated === 1){
        const dbCmd = db.command
        let res = await db.collection('uni-id-device')
                          .where({
                            user_id:userInfo.uid,
                            token_expired: dbCmd.gt(Date.now()),
                            device_id: dbCmd.neq(clientInfo.deviceId),
                            appid: clientInfo.appId
                          })
                          .field({push_clientid:true})
                          .get()
        
        const push_clientid = res.data.map(item=>item.push_clientid)
        if(push_clientid.length === 0){
          return
        }
        // 通知此用户的其他设备，该会话的未读消息数已经被清零
        let pushParam = {
          push_clientid,
        	"payload": {
        		type: "uni-im",
            // 定义发送消息的设备id，防止发送者处理了自己的指令
            device_id: clientInfo.deviceId,
        		data: {
        			type: "clear-conversation-unreadCount",
              conversation_id: where.id,
              create_time: updateData.update_time,
              to_uid: userInfo.uid,
              from_uid: userInfo.uid
        		}
        	},
          settings:{
            strategy:{
              // 只通知在线的应用
              default:3
            }
          }
        }
        const uniImCo = uniCloud.importObject("uni-im-co")
        try{
          let res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
          console.log('uni-im-conversation beforeUpdate sendPushMsg res:',res);
        }catch(e){
          console.error('uni-im-conversation beforeUpdate sendPushMsg error:',e);
        }
      }
    }
	}
}
