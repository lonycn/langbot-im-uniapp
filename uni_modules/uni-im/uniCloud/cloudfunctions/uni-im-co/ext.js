const db = uniCloud.database()
const dbCmd = db.command
module.exports = {
	async getUnreadCount() {
	  let unreadCount = 0
	  let unreadCountObj = {}
	  let res = await db.collection('uni-im-conversation')
	    .where({
	      user_id: this.current_uid,
	      leave: dbCmd.neq(true),
	      mute: dbCmd.neq(true),
	      unread_count: dbCmd.neq(0),
				hidden: dbCmd.neq(true),
	    })
	    .orderBy('unread_count', 'desc')
			.field({
				id: true,
				unread_count: true,
			})
	    .limit(100) //最多只要100，超过99的显示99+
	    .get()
	  res.data.forEach(item => {
	    unreadCount += item.unread_count
	    unreadCountObj[item.id] = item.unread_count
	  })
	  return {
			errcode: 0,
			data: {
				unreadCount,
				unreadCountObj
			}
	  }
	},
	async getUserIdByExtUid(ext_uid){
		const {data:[userInfo]} = await db.collection('uni-id-users').where({
			/*identities:{
				provider: 'uniImExternal',
				uid: ext_uid,
			}*/
			// TODO：不使用identities，解决部分服务空间不支持数组查询的问题
			uni_im_ext_uid: ext_uid
		})
		.field({
			_id: true
		})
		.get()
		
		if (!userInfo) {
			return {
				errcode: 1001,
				errmsg: '用户不存在'
			}
		} else {
			return {
				errcode: 0,
				data: userInfo._id
			}
		}
	}
}