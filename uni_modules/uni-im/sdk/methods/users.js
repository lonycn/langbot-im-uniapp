import $state from '../state/index.js';
let $users = {
  system: {
    _id: 'system',
    nickname: '系统消息',
    avatar_file: '/static/uni-im/avatar/system.png',
  },
  merge(usersInfo) {
    if (Array.isArray(usersInfo)) {
      let obj = {}
      usersInfo.forEach(item => {
        obj[item._id] = item
      })
      usersInfo = obj
    }
		for(let key in usersInfo){
			const {nickname} = usersInfo[key]
			if (nickname && !nickname.includes('(')){
				usersInfo[key] = new Proxy(usersInfo[key], {
					get(target, prop) {
						if(prop === 'nickname'){
							const alias = $state.userAlias[target._id]
							if(alias){
								return target[prop] + ' (' + alias + ')'
							}
						}
						return target[prop]
					}
				})
			} else {
				console.log('已经代理过了',usersInfo[key].nickname)
			}
		}
    Object.assign($state.users, usersInfo)
  },
  find(param) {
    param = Array.isArray(param) ? param : [param]
    let usersInfo = []
    param.forEach(uid => {
      const userInfo = $state.users[uid]
      if (userInfo) {
        usersInfo.push(userInfo)
      }
    })
    return usersInfo
  },
  async get(param) {
    const uid_list = Array.isArray(param) ? param : [param]
    // 信息在本地不存在的用户id
    let new_uid_list = [];
    let userInfoList = [];
    uid_list.forEach(uid => {
      let userInfo = $state.users[uid]
      if (userInfo && !this.loadTask.list.includes(uid)) {
        userInfoList.push(userInfo)
      } else {
        new_uid_list.push(uid)
      }
    })
    if (new_uid_list.length) {
      // 从云端加载本地不存在的用户数据
      const db = uniCloud.database();
      let res = await db.collection('uni-id-users').where({
          "_id": db.command.in(new_uid_list)
        })
        .field('_id,nickname,avatar_file,realname_auth')
        .get()
      $state.users.merge(res.result.data.reduce((obj, item) => {
				obj[item._id] = item
				return obj
			}, {}))
			// 拿到sdk处理后的用户数据
			userInfoList.push(...this.find(new_uid_list))
      // console.log('从云端加载本地不存在的用户数据',new_uid_list.length,res.result.data, res,$state.users)
    }
    return Array.isArray(param) ? userInfoList : userInfoList[0]
  },
  getNickname(user_id,tmpNickname = '[昵称加载中...]'){
    const nickname = $state.users[user_id]?.nickname
    if(nickname){
      return nickname
    } else {
      // 如果用户信息不存在，先加入队列
      $users.loadTask.add(user_id)
      
      $state.users[user_id] = {
        nickname:tmpNickname,
        _id:user_id,
        __loading:true
      }
      return $state.users[user_id]?.nickname
    }
  },
  // 设置一个队列加载用户信息避免频繁请求
  loadTask:{
    list:[],
    add(uids){
      uids = Array.isArray(uids) ? uids : [uids],
      this.list.push(...uids)
      this.run()
    },
    run(){
      // console.log('run-loadTask0')
      if(this.timer){
        clearTimeout(this.timer)
      }
      // console.log('run-loadTask1')
      this.timer = setTimeout(()=>{
        this.timer = null
        if(this.list.length){
          // console.log('run-loadTask2')
          // 去重
          this.list = [...new Set(this.list)]
          $users.get(this.list)
          this.list = []
        }
      },300)
    }
  }
}
export default $users;