// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database();
const dbCmd = db.command
const {hideUsernameStr,hideEmailStr,hideMobileStr,encrypt,decrypt} = require('uni-im-utils')
module.exports = {
	trigger: {
		async afterReadAsSecondaryCollection(e) {
			await afterReadAction(e, true)
		},
		async afterRead(e) {
			await afterReadAction(e)
		}
	}
}

async function afterReadAction({
	field = '',
	result,
	userInfo: currentUserInfo,
	primaryCollection
} = {}, asSecondaryCollection = false) {
  const {data} = result
  if (!Array.isArray(data)) {
  	data = [data]
  }
  if(data.length === 0) return
  const isAdmin = currentUserInfo.role.includes('uni-im-admin') || currentUserInfo.role.includes('admin') || currentUserInfo.role.includes('staff')
  // 处理当前表被作为联查时的副表的情况
  let userInfos = data
  if (asSecondaryCollection && typeof(data[0]) == "object" && data[0] != null) {
    // 完全列举主表表名的值
  	const foreignKeysObj = {
  		"uni-im-group-member":"user_id",
  		"uni-im-friend":"friend_uid"
  	}
  	const foreignKey = foreignKeysObj[primaryCollection]
  	if(foreignKey in data[0]){
      userInfos = data.map(item => item[foreignKey][0])
  	}else{
      throw new Error('触发器uni-id-users.schema.ext.js，未在当前操作生效。请补充：主表表名及其foreignKey的值，到触发器uni-id-users.schema.ext.js的变量foreignKeysObj内');
  	}
  }
 
  // 如果不是管理员，且不是仅查自己的信息
  if (!isAdmin && (userInfos.length != 1 || userInfos[0]._id != currentUserInfo.uid) ){
    let needHideFields = []
    if(field.includes("email")){
      needHideFields.push('email')
      console.log('非管理员，只能查看自己的邮箱')
    }
    if(field.includes("realname_auth")){
      needHideFields.push('realname_auth')
      // console.log('非管理员，只能查看自己的认证信息')
    }
    userInfos.forEach(item => {
      needHideFields.forEach(field => {
        delete item[field]
      })
    })
  }
  
  userInfos.forEach(item => {
    const real_name = item.realname_auth ? item.realname_auth.real_name : ''
    // 如果real_name以uni-im-encrypt:开头
    if (real_name.startsWith('uni-im-encrypt:')) {
      // console.error('解密real_name',real_name,item._id)
      item.realname_auth.real_name = decrypt(real_name)
      // console.error('解密后real_name',item.realname_auth.real_name)
    }
  })
  
  if (field.includes("nickname")) {
  	//uni-im 处理查询nickname，但值为空的情况
  	// 记录没有nickname的用户id
  	const user_ids = userInfos.filter(item => !item.nickname).map(item => item._id)
  	let	usersInfo = {};
  	if (user_ids.length) {
  		console.info('注意：uni-im项目用户数据依赖nickname。有' + user_ids.length +
  			`个用户数据 nickname 的值为空，已多执行一次数据库查询：将此用户的“用户名”或“邮箱”或“手机号”脱敏后，作为nickname输出。请引导用户完善nickname，减少查库次数`)
  		let res = await db.collection('uni-id-users')
  			.where({
  				_id: dbCmd.in(user_ids)
  			})
  			.field({
  				username: true,
  				email: true,
  				mobile: true
  			})
  			.limit(1000)
  			.get()
  		usersInfo = res.data.reduce((sum, current) => {
  			sum[current._id] = current
  			return sum
  		}, {})
      console.error('---usersInfo',usersInfo)
  	}
    
  	userInfos.forEach(item => {
  		if (!item.nickname) {
  			const userInfo = usersInfo[item._id] || {}
  			// 管理员可以看到不打码的
  			if (isAdmin) {
          console.log('userInfo',userInfo,'item',item)
  				item.nickname = userInfo.username || userInfo.email || userInfo.mobile
  			}else{
  				item.nickname = hideUsernameStr(userInfo.username) || hideEmailStr(userInfo.email) ||
  										hideMobileStr(userInfo.mobile)
  			}
  		}else if(!isAdmin && item.nickname.includes('@')){
  			// 如果昵称为邮箱则脱敏处理
  			item.nickname = hideEmailStr(item.nickname)
  		}
  	})
  }
}