// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
const uniImCo = uniCloud.importObject("uni-im-co")
module.exports = {
	trigger: {
		async beforeRead({
			where,
			userInfo
		}) {
			if (where.user_id != userInfo.uid) {
				if (where.group_id) {
					let res = await db.collection('uni-im-group-member')
						.where({
							group_id: where.group_id,
							user_id: userInfo.uid
						})
						.get()
					// console.log(res);
					if (res.data.length === 0) {
            return [] //不是群成员返回空（场景：被踢出群后，点开群）
						// throw new Error('不是群成员，不能查询')
					}
				}
			}
		},
		async afterRead(){},
    async beforeCreate({addDataList,userInfo,triggerContext}){
      if(addDataList.length !== 1 ){
        throw new Error('jql方式创建uni-im-group-member，️只能创建一条数据')
      }
      if(!addDataList[0].role){
        addDataList[0].role = []  // 角色默认为空
      }
      if(!addDataList[0].mute_type){
        addDataList[0].mute_type = 0  // 是否免打扰默认为false
      }
      addDataList.create_time = Date.now()
      const [{group_id}] = addDataList
      // 1. 判断操作者，必须是应用管理员（可由触发器触发时会设置role为admin）或者是群的管理员
      if(!userInfo.role.includes('admin')){
        // 不是应用管理员，判断是否是群管理员
      	let res = await db.collection('uni-im-group-member')
      									.where({group_id,"user_id":userInfo.uid})
      									.get()
      	// console.log('---',res.data);
      	if( !(res.data[0] && res.data[0].role.includes('admin')) ){
      		throw Error('没有权限')
      	}
      }
      // 2. 群是否存在
      let res = await db.collection('uni-im-group').doc(group_id).get()
      if (res.data.length == 0) {
      	throw new Error('非法群id')
      }
      triggerContext.groupInfo = res.data[0]
    },
		async afterCreate({
			addDataList,
			clientInfo,
      userInfo,
      result,
      triggerContext
		}) {
      // before中已校验： jql方式创建uni-im-group-member，️只能创建一条数据 
			let [addData] = addDataList
      addData._id = result.id
      const {user_id,group_id} = addData
      // 通知所有群成员，有用户加入群聊
      console.log('通知所有群成员，有用户加入群聊')
      const msgData = {
      	body:{
          new_member_list:[addData],
          // 冗余字段记录成员id，方便客户端显示
          user_id_list:[user_id]
        },
        action:"join-group",
      	type:"system",
      	create_time: Date.now(),
      	conversation_id:"group_" + group_id,
      	group_id,
        appId:clientInfo.appId
      }
      // 更新群成员数量
      await db.collection('uni-im-group')
              .doc(group_id)
              .update({
                member_count:db.command.inc(1)
              })
      await uniImCo.sendMsg(msgData,user_id)
      const {type} = triggerContext.groupInfo || {}
      if(type === "dcloud-plugin"){
        // 刷新记录在im系统中的 插件订单信息
        try{
          console.error('加入了dcloud-plugin',triggerContext.groupInfo)
          const uniImRobot = uniCloud.importObject("uni-im-robot")
          await uniImRobot.refreshPluginOrder({
            plugin_id:triggerContext.groupInfo.ext.dcloud_plugin_id,
            user_id,
            group_id
          })
        }catch(e){
          console.error('刷新记录在im系统中的 插件订单信息 错误',e)
        }
      }
		},
		async beforeDelete({
			where,
			userInfo,
      clientInfo
		}) {
			// console.log('where---', where);
			let {
				group_id,
				user_id
			} = where
			//查群相关信息
			let res = await db.collection('uni-im-group').doc(group_id).get()
      const groupInfo = res.data[0]
      if (groupInfo.user_id == user_id) {
      	throw Error('群主不能退群')
      }
      
      // 操作者不是群主，且不是操作自己退群。时查询操作者的角色，必须是群管理员
      if( ![groupInfo.user_id,user_id].includes(userInfo.uid) ){
        // 查一下当前用户在此群的角色
        let res = await db.collection("uni-im-group-member").where({
          group_id: groupInfo._id,
          user_id: userInfo.uid
        }).get()
        if(res.data.length == 0){
          throw new Error('你不是群成员，不能操作')
        }
        console.log('res.data',res.data);
        if(!res.data[0].role.includes('admin')){
          throw new Error('你不是群管理员，不能操作')
        }
      }
      
      // 通知所有群成员，有用户离开群
      const msgData = {
      	body:{
          user_id_list:[user_id]
        },
        action:"group-expel",
      	type:"system",
      	create_time: Date.now(),
      	conversation_id:"group_"+group_id,
      	group_id,
        appId:clientInfo.appId
      }

      const dbJQL = uniCloud.databaseForJQL({clientInfo});
      let title,content;
      //自己操作的是 主动退出的 否则是被踢掉的
      if (userInfo.uid == user_id) {
        title = '用户退群通知'
        content = "用户退出，群聊：" + groupInfo.name;
      	msgData.action = "group-exit"
      } else {
        title = '用户被踢出群聊通知'
        content = "用户被踢出，群聊：" + groupInfo.name;
      	msgData.action = "group-expel"
      }
      
      await uniImCo.sendMsg(msgData,'system')
      console.log('res',res);
		},
		async afterDelete({
			where,
			userInfo,
			clientInfo
		}) {
			// console.error('2 where---', where);
			let {
				group_id,
				user_id
			} = where

			// 删除相关此用户的会话数据
			let res = await db.collection('uni-im-conversation').where({
				group_id,
				user_id
			}).remove()
			// console.error('Delete uni-im-conversation:', res, where);
      // 更新群成员数量
      await db.collection('uni-im-group')
              .doc(group_id)
              .update({
                member_count:db.command.inc(-1)
              })
		},
    async beforeUpdate({where,updateData,userInfo,docId,clientInfo}){
      
      // 限制群主的不能被修改
      let _id = where._id || docId
      console.log('_id',_id);
      let res = await db.collection('uni-im-group-member').doc(_id).get()
      const member = res.data[0]
      if(member.role.includes("creator")){
        throw Error('群主不能被修改')
      }
      
      //查 当前用户在此群的角色，判断是不是群管理员
      res = await db.collection('uni-im-group-member').where({
        group_id:member.group_id,
        user_id:userInfo.uid,
        role:db.command.in(['admin','creator'])
      }).get()
      
      if(res.data.length === 0){
        throw Error('非群管理员不能修改群成员信息')
      }
      
      if('role' in updateData){
        // 判断传入的role（updateData.role）和 用户原来的userInfo.role，推测出是增加了某个角色还是减少了
        let addRole = updateData.role.filter(v=>!member.role.includes(v))
        let delRole = member.role.filter(v=>!updateData.role.includes(v))
      
        // 通知指定的群
        const msg = {
          appId:clientInfo.appId,
          body: {
            "user_id":member.user_id,
            addRole,
            delRole
          },
          type: "system",
          action:"set-group-admin",
          from_uid: 'system',
          create_time: Date.now(),
          conversation_id: "",
          group_id: member.group_id
        }
        const uniImCo = uniCloud.importObject("uni-im-co")
        return await uniImCo.sendMsg(msg,'system')
      }else{
        console.log('updateData',updateData);
      }
    }
	}
}
