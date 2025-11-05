// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database()
const utils = require('uni-im-utils')
module.exports = {
	trigger: {
		async beforeCreate({
			addDataList,
			clientInfo,
      triggerContext,
      userInfo
		}) {
			const dbJQL = uniCloud.databaseForJQL({clientInfo})
			if (addDataList.length === 1) {
				let [{
					group_id
				}] = addDataList
        
        // 1. 如果用户已经加群，直接抛出 new Error('已经是群成员')
        let res = await dbJQL.collection('uni-im-group-member')
        	.where(`"group_id" == "${group_id}" && "user_id" == $cloudEnv_uid && is_delete != true`)
        	.get()
        if (res.data.length != 0) {
          const errorObj = new Error()
          errorObj.message = '已经是群成员'
          errorObj.code = 10001
        	throw errorObj
        }
        
				// 2. 拉取群资料，同时验证了群id的合法性
				res = await db.collection('uni-im-group').doc(group_id).get()
				if (res.data.length == 0) {
					throw new Error('非法群id')
				}else if (res.data[0].is_delete) {
          throw new Error('此群已解散')
        }
        
				// console.log('res.data', res.data);
				const groupInfo = res.data[0]
        triggerContext.group = groupInfo
				
				if (groupInfo.join_option == "disableApply") {
					throw new Error('此群禁止任何人申请加入')
				}else{
					//到after中处理
				}
				
        // 3. 判断用户是否被拉黑
        let res2 = await db.collection('uni-im-group-member-black')
        									.where({
        										group_id,
                            user_id: userInfo.uid,
                          })
                          .get()
        if(res2.data.length > 0){
          throw new Error('你已被拉黑，不能加入此群')
        }
        // 4. 判断用户是否已经绑定手机号，系统管理员除外
        const check_mobile = utils.getConfig('check_mobile')
        if(check_mobile && !userInfo.role.includes('uni-im-admin') && !userInfo.role.includes('staff')){
          let res3 = await db.collection('uni-id-users').where({_id:userInfo.uid}).get()
          if(!res3.data[0].mobile_confirmed){
            throw new Error('账号未绑定手机号无法加入群聊。请完成绑定后退出本系统并重新登录，再尝试加入群聊。')
          }
        }
			} else {
				throw new Error('非法参数')
			}
		},
		async afterCreate({
			addDataList,
			clientInfo,
			result,
      triggerContext
		}) {
			let [{
				_id,user_id,group_id,message
			}] = addDataList
			// console.log('addDataList',addDataList);
			// console.log('clientInfo',clientInfo);
			const groupInfo = triggerContext.group
			const dbJQL = uniCloud.databaseForJQL({clientInfo})
      // 是否已经通过
      result.isPass = false
			if (groupInfo.join_option == "freeAccess") {
        result.isPass = true
				dbJQL.setUser({
					uid: user_id,
					role: ['admin'],
					permission: []
				})
				//直接给通过
				await dbJQL.collection('uni-im-group-join').where({
					user_id,group_id
				}).update({
					state: 100
				})
        result.isPass = true
			} else if(groupInfo.join_option == "needPermission"){
				let {
					data: [userInfo]
				} = await dbJQL.collection('uni-id-users')
					.where(`"_id" == $cloudEnv_uid`)
					.field('nickname,_id,avatar_file')
					.get()
				console.log(userInfo);
				let title = userInfo.nickname,
					content = "申请加入 "+groupInfo.name +	"\n" + message
				let pushParam = {
					"user_id": groupInfo.user_id, //群创建人id，后续升级为所有群管理员id
					"payload": {
						type: "uni-im-notification", // im消息通知，比如加好友请求，有用户退群等
						subType: "uni-im-group-join-request", // 通知子类型（可选）
						confirmText: "同意", // 确认按钮的文字（可选）
						cancelText: "拒绝", // 取消按钮的文字（可选）
						state: false, // 是否已经处理过 false 未处理，confirm：已确认，cancel：已拒绝（可选）
						unique: userInfo._id + '_' + groupInfo._id, // 去重字段，比如同一个用户重复申请加好友，通知数据始终只显示一条，但是会通知多次（可选）
						data: { // 自定义的其他参数（可选）
							userInfo,
							groupInfo,
							doc_id:result.id
						},
						avatar_file: userInfo.avatar_file, // 头像或图标的图片地址，支持Base64
					},
					title,
					content
				}
				// console.log(123, pushParam);
				//发消息通知群主，有用户申请加入群聊
				const uniImCo = uniCloud.importObject("uni-im-co")
				res = await uniImCo.sendPushMsg(pushParam,clientInfo.appId)
				// console.log(8989989, res);
				
				// 删除之前提交的
				// res = await db.collection('uni-im-group-join')
				// 	.where({
				// 		group_id,
				// 		user_id: userInfo._id
				// 	})
				// 	.remove()
				// console.log('res 把旧的删了',res);
			}
		},
		async beforeRead({
			where,
			clientInfo
		}) {
			//获取自己的加群列表不走clientDB

			/*
			// let {group_id} = where
			console.log('where:',where)
			let {data:[item]} = await db.collection('uni-im-group-member').where({group_id}).get()
			if(!item.role.includes('admin')){
				throw new Error('仅群管理员可见')
			}
			where.group_id*/
		},
		async beforeUpdate({
			where,
			updateData,
			clientInfo,
			userInfo
		}) {
			// console.log(123,'where',where)
			if (updateData.state == 100) {
				let {
					data: [item]
				} = await db.collection('uni-im-group-join').where(where).get()
				// console.log(item,clientInfo);
				const {
					user_id,
					group_id
				} = item
				// console.log({group_id,user_id});
				// 判断操作者，必须是应用管理员（可由触发器触发时会设置role为admin）或者是群的管理员
				if(!userInfo.role.includes('admin') ){
					let res = await db.collection('uni-im-group-member')
													.where({group_id,user_id:userInfo.uid})
													.get()
					console.log('---',res.data);
					if( !(res.data[0] && res.data[0].role.includes('admin')) ){
						throw Error('没有权限')
					}
				}
        
        // TODO：由于支付宝云版uniCloud，唯一索引插入数据并不会抛出异常，所以这里要先查询是否已经在群里
        let hasInGroup = await db.collection('uni-im-group-member')
          .where({group_id,user_id})
          .get()
        if (hasInGroup.data.length !== 0) {
          return console.error('用户已经在群里')
        }
				
				const dbJQL = uniCloud.databaseForJQL({
					clientInfo,
					// skipTrigger: 
				})
				// 添加操作权限
				dbJQL.setUser({
					uid: userInfo.uid, // 建议此处使用真实uid
					role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
					permission: []
				})
				//成为群成员
				let res = await dbJQL.collection('uni-im-group-member').add({
					group_id,
					user_id,
				})
				// console.log('next', {
				// 	res,
				// 	updateData
				// });
			}
		}
	}
}
