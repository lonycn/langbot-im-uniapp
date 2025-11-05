const { getConversationId } = require('uni-im-utils')

// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
module.exports = {
	trigger: {
		async afterCreate({
			addDataList,
			clientInfo
		}) {
			if (addDataList.length === 1) {
				// a加b为好友 自动 将b加a为好友
				let [data] = addDataList
				let {
					friend_uid,
					user_id
				} = data
				data.friend_uid = user_id
				data.user_id = friend_uid
				
				const dbJQL = uniCloud.databaseForJQL({
					clientInfo
				})
				
				let {data:userList} = await dbJQL.collection('uni-id-users').where({
					"_id":dbJQL.command.in([friend_uid,user_id])
				})
				.field('_id,nickname,avatar_file')
				.get()
				
				let friendInfo = userList.filter(i=>i._id == friend_uid)[0]
				let userInfo = userList.filter(i=>i._id == user_id)[0]
				
				// console.log(12313132131,{userList,friendInfo,userInfo})
				
				// console.log('do uni-im-friend afterCreate');
				// console.log(data);
				let res = await db.collection('uni-im-friend').add(data)
				// console.log('1231', res);
				
				dbJQL.setUser({
					uid: user_id, // 建议此处使用真实uid
					role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
					permission: []
				})
				let conversationId = getConversationId({
					from_uid: user_id,
					to_uid: friend_uid,
				})
				res = await db.collection('uni-im-conversation')
						.where({id:conversationId,friend_uid})
						.get()
				// 查询是否存在，防止未加好友时发起过会话重复创建
				if(res.data.length === 0){
					res = await dbJQL.collection('uni-im-conversation').add({
						id: conversationId,
						user_id,
						friend_uid,
						type: 1,
						unread_count: 0
					})
				}else{
					console.log('会话已存在')
				}
				
				
				//发消息通知 被邀请加好友的用户
				let pushParam = {
					"user_id": friend_uid, 
					"payload": {
						type: "uni-im-notification",
						subType: "uni-im-friend-add",
						// avatar_file: userInfo.avatar_file, // 头像或图标的图片地址，支持Base64
						data: {
							from_uid: user_id,
							to_uid: friend_uid,
						},
						unique:[user_id,friend_uid].sort().join('_')
					},
					title:"成功加为好友通知", 
					content:'你已成功添加"'+ userInfo.nickname +'"为好友',
				}
				// console.log(123, pushParam);
				const uniImCo = uniCloud.importObject("uni-im-co")
				res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
				// console.log(8989989, res);
				pushParam.user_id = user_id
				pushParam.content = '你已成功添加"'+ friendInfo.nickname +'"为好友'
				res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
			} else {
				throw new Error('非法参数')
			}
		},
		async beforeDelete({
			where,
			clientInfo
		}) {
			console.log('where',{where});
			if (where && where.friend_uid) {
				let {
					data: [friendData]
				} = await db.collection('uni-im-friend').where(where).get()
				if (friendData) {
					let {
						friend_uid,
						user_id
					} = friendData
					const dbJQL = uniCloud.databaseForJQL({
						clientInfo
					})
					let {data:userList} = await dbJQL.collection('uni-id-users').where({
						"_id":dbJQL.command.in([friend_uid,user_id])
					})
					.field('_id,nickname,avatar_file')
					.get()
					let friendInfo = userList.filter(i=>i._id == friend_uid)[0]
					let userInfo = userList.filter(i=>i._id == user_id)[0]
					
					// console.log(12313132131,{userList,friendInfo,userInfo})
					
					let res = await db.collection('uni-im-friend')
						.where({
							friend_uid: user_id,
							user_id: friend_uid
						})
						.remove()
					console.log('同步删除好友',res);
					
					dbJQL.setUser({
						uid: user_id, // 建议此处使用真实uid
						role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
						permission: []
					})
					
					let conversationId = getConversationId({
						from_uid: user_id,
						to_uid: friend_uid,
					})
					res = await dbJQL.collection('uni-im-conversation')
									.where({
										"id": conversationId
									})
									.remove()
					console.log('同步删除相关会话',res);
					//发消息通知 用户成功删除好友
					let pushParam = {
						"user_id": friend_uid, //群创建人id，后续升级为所有群管理员id
						"payload": {
							type: "uni-im-notification", // im消息通知，比如加好友请求，有用户退群等
							subType: "uni-im-friend-delete", // 通知子类型（可选）
							// avatar_file: userInfo.avatar_file, // 头像或图标的图片地址，支持Base64
							data: {
								conversationId,
								from_uid:user_id,
								to_uid:friend_uid
							},
							unique:[user_id,friend_uid].sort().join('_')
						},
						title:"好友关系解除通知",
						content:'"'+ userInfo.nickname +'"与你解除好友关系'
					}
					// console.log(123, pushParam);
					const uniImCo = uniCloud.importObject("uni-im-co")
					res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
					// console.log(8989989, res);
					pushParam.user_id = user_id
					pushParam.content = '你已成功与"'+ friendInfo.nickname +'"解除好友关系'
					res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
					// console.log(8989989, res);
				} else {
					throw new Error('不是好友')
				}
			} else {
				throw new Error('非法参数1')
			}
		},
		async afterRead({result}){
			result.data.forEach(item=>{
				let friendInfo = item.friend_uid[0]
			})
		}
	}
}
