// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const {
  db,
  checkParam,
} = require('uni-im-utils')
module.exports = {
	trigger: {
		async beforeCreate({addDataList,userInfo}){
			if(addDataList.length > 1){
				throw new Error('一次调用只能创建一个群公告')
			}
			const [data] = addDataList
			console.log('data',data)
			await isGroupAdmin(data.group_id,userInfo)
		},
		async beforeDelete({where,userInfo}){
			checkParam(where, {
			  required: ["_id", "group_id"],
			  type: {
			    _id: ["String"],
			    group_id: ["String"],
			  }
			})
			await isGroupAdmin(where.group_id,userInfo)
		},
		async afterDelete({where,userInfo,clientInfo,result}){
			await setUnreadGroupNoticeId({
				modelType: 'delete',
				notice: {
					_id: where._id,
					group_id: where.group_id
				},
				clientInfo
			})
		},
		async beforeUpdate({where,updateData,docId,userInfo}){
			checkParam(where, {
		    required: ["_id", "group_id"],
		    type: {
		      _id: ["String"],
		      group_id: ["String"],
		    }
		  })
			// if (where.user_id !== userInfo.uid) {
			// 	throw new Error('只能修改自己创建的群公告')
			// }
		  await isGroupAdmin(where.group_id,userInfo)
		},
		async afterUpdate({where,userInfo,clientInfo,result,updateData}){
			await setUnreadGroupNoticeId({
				modelType: 'update',
				notice: {
					_id: where._id,
					group_id: where.group_id,
					...updateData
				},
				clientInfo
			})
		},
		async beforeGet({where,clientInfo,userInfo}){
			checkParam(where, {
		    required: ["group_id"],
		    type: {
		      group_id: ["String"]
		    }
		  })
			await isGroupMember(group_id,userInfo)
		},
		async afterCreate({addDataList:[data],userInfo,clientInfo,result}){
			console.error('afterCreate result',result)
			data._id = result.id
			await setUnreadGroupNoticeId({
				modelType: 'add',
				notice: data,
				clientInfo
			})
		}
	}
}

async function setUnreadGroupNoticeId({notice,clientInfo,modelType}){
	const {_id: notice_id,group_id} = notice
	const promiseArr = []
	const res = db.collection('uni-im-conversation')
		.where({
			group_id,
			// 删除操作，相等的情况下才能删除，否则会出现删除旧公告把新公告的通知“提示符”给清除的情况
			unread_group_notice_id: modelType === 'delete' ? notice_id : db.command.neq(notice_id)
		})
		.update({
			unread_group_notice_id: modelType === 'delete' ? '' : notice_id,
			update_time: Date.now()
		})
	promiseArr.push(res)
	
	// 发送群公告通知到群消息
	const msgData = {
		action:"setUnreadGroupNoticeId",
		body:{
			type: modelType, // add delete update
			notice_id,
			group_id,
			content: notice.content
		},
		type: "system",
		group_id,
		appId:clientInfo.appId,
	}
	// 删除动作，是静音的免存库消息
	if (modelType === 'delete') {
		msgData.is_mute = true
		msgData.noSaveToDB = true
	}
	// 除了添加动作，更新和删除都需要把之前的消息撤回
	if (modelType != 'add') {
		const promise = db.collection('uni-im-msg')
											.where({
												// 筛选创建时间小于当前的，避免因异步引起的错误。比如更新操作，新旧两条记录的notice_id的值一致
												create_time: db.command.lt(Date.now()),
												body: {notice_id}
											})
											.update({
												is_revoke: true,
												update_time: Date.now()
											})
		promiseArr.push(promise)
	}
	const uniImCo = uniCloud.importObject("uni-im-co")
	console.error('msgData',msgData)
	const res2 = uniImCo.sendMsg(msgData,'system')
	promiseArr.push(res2)
	
	await Promise.all(promiseArr)
}

async function isGroupMember(group_id,userInfo){
	// 判断是不是此群的管理员
	const isGroupMemberRes = await db.collection('uni-im-group-member').where({
	  group_id,
	  user_id: userInfo.uid
	}).get()
	console.log('isGroupMemberRes',isGroupMemberRes)
	const [groupMember] = isGroupMemberRes.data
	if(!groupMember){
	  throw Error('非法操作，不是群成员')
	}
	return groupMember
}
	 

async function isGroupAdmin(group_id,userInfo){
  if(userInfo.uid != 'system'){
    // 判断是不是此群的管理员
    const groupMember = await isGroupMember(group_id,userInfo)
    if(!groupMember.role.includes('admin')){
      throw Error('非法操作，不是管理员')
    }
  }
}