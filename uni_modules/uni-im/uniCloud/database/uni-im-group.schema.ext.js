// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
const uniImCo = uniCloud.importObject("uni-im-co")
module.exports = {
	trigger: {
    async beforeUpdate({where,updateData,clientInfo,docId,userInfo}){
      const group_id = where._id || docId;
      if(!group_id){
        throw new Error('jql方式更新uni-im-group，️必须传入群ID')
      }
      
      if(userInfo.uid != 'system'){
        // 判断是不是此群的管理员
        let getGroupMemberRes = await db.collection('uni-im-group-member').where({
          group_id,
          user_id:userInfo.uid
        }).get()
        console.log('getGroupMemberRes',getGroupMemberRes)
        const [groupMember] = getGroupMemberRes.data
        if(!groupMember){
          throw Error('非法操作，不是群成员')
        }else if(!groupMember.role.includes('admin')){
          throw Error('非法操作，不是管理员')
        }
      }
     
      let field = Object.keys(updateData)[0]
      if(field == 'notification'){
        // 如果是群公告，增加一个公告的创建时间
        updateData[field].create_time = Date.now()
        await db.collection('uni-im-conversation').where({
          group_id,
        }).update({
          has_unread_group_notification: true
        })
      }
    },
    async afterUpdate({where,updateData,clientInfo,userInfo}){
      let field = Object.keys(updateData)[0]
      let fieldsName = {
        "avatar_file":"群聊头像",
        "name":"群聊名称",
        "introduction":"群简介",
        "notification":"群公告",
        "mute_all_members":"全群禁言"
      }[field];
      if(!fieldsName){
        return console.log('字段：'+field+'已更新，未配置为推送绑定字段。无需通知所有群成员');
      }
      const group_id = where._id
      if(field === 'mute_all_members'){
        // 群成员表中增加一个字段，记录禁言状态，这样就不需要再查群信息表了
        await db.collection('uni-im-group-member').where({
          group_id,
        }).update({
          // 禁言程度：0-正常，1-被单独禁言或被全群禁言 2-被单独禁言且被全群禁言
          mute_type: updateData[field] ? 1 : 0 // db.command.inc(updateData[field] ? 1 : -1) // TODO未知原因，暂时先用1和0代替
        })
      }
      
      // 通知所有群成员，群资料更新
      const msgData = {
        action:"update-group-info-"+field,
        body:{updateData,fieldsName},
      	type:"system",
      	create_time: Date.now(),
      	conversation_id:"group_"+group_id,
      	group_id,
        appId:clientInfo.appId
      }
      await uniImCo.sendMsg(msgData,userInfo.uid)
    },
		async beforeDelete({where,userInfo,triggerContext}){
			if(!triggerContext){
				throw new Error('执行删除群失败！你的HBuilderX版本过低，请使用3.6.16及以上版本')
			}
			
			let {data:[groupInfo]} = await db.collection('uni-im-group').doc(where._id).get()
			triggerContext.groupInfo = groupInfo
			console.log('beforeDelete',where,groupInfo);
			let {data:[has]} = await db.collection('uni-im-conversation')
										.where({
											group_id:where._id,
											user_id:userInfo._id
										})
										.get()
			if(!has||!groupInfo){
				throw new Error('限群创建者操作')
			}
		},
		async afterDelete({where,clientInfo,userInfo,triggerContext}){
			console.log('beforeDelete',where,triggerContext);
			const group_id = where._id
      
      //使用软删除，否则用户就收不到解散群的通知
      let res = await db.collection('uni-im-group-member')
        .where({group_id})
        .update({"is_delete":true})
        
      console.log('beforeDelete',res);

      // 通知所有群成员，有用户离开群
      const msgData = {
        action:"group-dissolved",
      	type:"system",
      	create_time: Date.now(),
      	conversation_id:"group_"+group_id,
      	group_id,
        appId:clientInfo.appId,
        body:{
          groupName:triggerContext.groupInfo.name,
        }
      }
      // 临时方案 加一条被软删除的群记录
      await db.collection('uni-im-group').add({
        ...triggerContext.groupInfo,
        is_delete:true
      })
      await uniImCo.sendMsg(msgData,userInfo.uid)
		}
	}
}
