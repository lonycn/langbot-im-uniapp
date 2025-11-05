// 获取 uni-im 配置
const createConfig = require("uni-config-center");
const uniImConfig = createConfig({
  pluginId: 'uni-im'
})
const getExternalUserInfo = uniImConfig.config('get_external_userinfo') || ''
const loginAfterHookUrl = uniImConfig.config('login_after_hook_url')
module.exports = {
	async login(param){
		// console.log('login',param)
		let userInfo;
		if (
			// 如果请求来源是http（入口文件beforeHttp.js 会验证请求是否合法） 或者 配置了不需要登录验证，直接根据传来的user_id和nickname进行登录
			this.clientInfo.source === 'http' ||
			getExternalUserInfo === 'use-param'
		){
			const { _id, nickname, avatar_file } = param
			userInfo = { _id, nickname, avatar_file }
		} 
		/*
		else if(getExternalUserInfo.includes('use-jwt-payload:')){
			// 拿到签名密钥，格式为： use-jwt-payload:secretKey
			const secretKey = getExternalUserInfo.split('use-jwt-payload:')[1]
			// 验证jwt
			let jwt;
			try {
				jwt = require('jsonwebtoken')
			} catch (error) {
				console.error('error========',error)
				return {
					errSubject: 'uni-im-co-login',
					errCode: 'Cannot find module jsonwebtoken',
					errMsg: '没有安装jsonwebtoken模块，请在uni-im-co目录下执行 npm i jsonwebtoken'
				}
			}
			try {
				// 获取jwt中的userInfo
				const jwtPayload = jwt.verify(param, secretKey)
				userInfo = jwtPayload.userInfo
			} catch (error) {
				return {
					errCode: "JWT_DATA_INVALID",
					errMsg: '无效的jwt数据',
				}
			}
		}
		*/
		else if(getExternalUserInfo){
			// 如果有配置登录验证回调地址,则调用回调地址进行登录验证
			if(!param.token && !param.uni_id_token){
				return {
					errCode: "TOKEN_NOT_EXIST",
					errMsg: '已配置登录验证回调地址，但token不存在',
				}
			}
			if(param.token && param.uni_id_token){
				throw new Error('token和uni_id_token只能存在一个')
			}
			
			const res = await uniCloud.request({
				url: getExternalUserInfo,
				method: 'POST',
				data: param,
				dataType: 'json'
			})
			console.log('getExternalUserInfo res',res)
			if(res.data.errCode){
				return res.data
			}
			userInfo = res.data.userInfo
		} else {
			throw new Error('请配置登录验证回调地址')
		}
		
		if(!userInfo){
			return {
				errCode: "USER_INFO_NOT_EXIST",
				errMsg: '回调信息缺少用户信息userInfo'
			}
		}
		const checkFields = ['_id','nickname','avatar_file']
		for(let i = 0; i < checkFields.length; i++){
			if(!userInfo[checkFields[i]]){
				return {
					errCode: "USER_INFO_NOT_EXIST",
					errMsg: `回调信息缺少${checkFields[i]}字段`
				}
			}
		}

		const uni_im_ext_uid = userInfo._id
		const useUniIdToken = param.uni_id_token ? true : false
		if(!useUniIdToken){
			delete userInfo._id
		}
		
		// 检查当前用户是否已经注册
		const db = uniCloud.database();
		const query = useUniIdToken ? {"_id": uni_im_ext_uid} : {
			/*identities:{
				provider: 'uniImExternal',
				uid: uni_im_ext_uid,
			}*/
			// TODO：不使用identities，解决部分服务空间不支持数组查询的问题
			uni_im_ext_uid
		}
		const userRes = await db.collection('uni-id-users').where({...query}).get()
		console.log('userRes',userRes)
		
		if(userRes.data.length === 0){
			console.log('用户不存在,注册用户',query,[query.identities],'uni_im_ext_uid',uni_im_ext_uid)
			// 注册用户
			const registerRes = await db.collection('uni-id-users').add({
					identities: useUniIdToken ? null : [{
						provider: 'uniImExternal',
						uid: uni_im_ext_uid,
					}],
				// TODO：冗余identities.uid，解决部分服务空间不支持数组查询的问题
				uni_im_ext_uid: useUniIdToken ? null :uni_im_ext_uid,
				...userInfo,
				create_time: Date.now(),
			})
			console.log('registerRes',registerRes)
			userInfo._id = registerRes.id
		}else{
			console.log('用户存在,更新用户信息')
			// 更新用户信息
			delete userInfo._id
			const updateRes = await db.collection('uni-id-users').where(query).update(userInfo)
			console.log('updateRes',updateRes)
			userInfo._id = userRes.data[0]._id
		}
		
		const uniIDIns = require('uni-id-common').createInstance({
			clientInfo: this.getClientInfo()
		})
		const newToken = await uniIDIns.createToken({
			uid: userInfo._id,
			role: userInfo.role
		})
		
		// 将主app的push客户端id记录到uni-id-device表，实现离线推送
		if(param.mainAppInfo){
			const {device_id,push_clientid,appid} = param.mainAppInfo
			const db = uniCloud.database();
			const deviceCollection = db.collection('uni-id-device')
			const {data:[deviceRecord]} = await deviceCollection.where({device_id}).get()
			const deviceData = {
				user_id: userInfo._id,
				device_id,
				push_clientid,
				appid,
				token_expired: newToken.token_expired
			}
			if (!deviceRecord) {
				await deviceCollection.add(deviceData)
			} else {
				await deviceCollection.where({device_id}).update(deviceData)
			}
		}
		
		
		// 请求外部服务器的接口，通知你的服务器用户已经登录成功
		if (loginAfterHookUrl) {
			const res = await uniCloud.request({
				url: loginAfterHookUrl,
				method: 'POST',
				data: {
					// 用户信息
					userInfo,
					// 客户端登录时传递的参数，可用于你的服务器“验证本次请求的合法性”等
					loginParam: param
				},
				dataType: 'json'
			})
			// console.log('loginAfterHookUrl res',res)
		}
		
		return {
			errorCode: 0,
			newToken
		}
	}
}