const uniIdCommon = require('uni-id-common')
const beforeHttp = require('./beforeHttp')
// 导入云函数方法
const modelNames = ['login','conversation','msg','_push','friend','group','ext','filtered-conversation','tools']
const modelObj = modelNames.map(modelName => require(`./${modelName}.js`)).reduce((obj, model) => Object.assign(obj, model), {})
// 定义无需登录即可访问的方法名称列表
const allowedMethodsWithouLogin = ['login']
module.exports = {
	...modelObj,
  async _before() {
		// 记录请求时间
		// this.requestStartTime = Date.now()
		
		
		// 拿到客户端信息
		this.clientInfo = this.getClientInfo()
		/** 
		 * 获取调用来源。本云函数可能被多种调用方式调用，包括：
		 * 1. http 调用，通过 beforeHttp.js 验证请求是否合法，并定义本次请求的：当前用户信息（uid、role）、客户端信息
		 * 2. 云函数互调，免校验 token 直接使用传来的用户信息
		 * 3. 客户端调用，需要校验 token
		 */
		const source = this.clientInfo.source || 'client'
		console.log('请求来源source = ',source);
		// 1. 验证请求是否合法 2. 定义本次请求的：当前用户信息（uid、role）、客户端信息）
		const verifyRequestAndSetInfo = {
			http(){
				beforeHttp.call(this)
				// 防止需要消息操作者的接口，没有传入操作者的id
				if( !this.current_uid && !allowedMethodsWithouLogin.includes(this.getMethodName()) ){
					throw {
						errCode: 'params-error',
						errMsg: '操作此方法的用户id不能为空'
					}
				}
			},
			function(){
				const options = this.getParams()[1]
				if (typeof options === 'string') {
					// 允许传入字符串，字符串的值是用户的id
					this.current_uid = options
					this.current_user_role = []
				} else if (options && typeof options === 'object') {
					// console.log('##################options',options,this.getParams());
					const {userInfo,clientInfo} = options
					if (userInfo){
						// 用户id 用户角色
						this.current_uid = userInfo._id
						this.current_user_role = userInfo.role || []
					}
					if (clientInfo){
						this.clientInfo = Object.assign(this.clientInfo,clientInfo)
					}
				}
			},
			async client(){
				// 除了登录接口，其他接口都需要校验 token
				if (!allowedMethodsWithouLogin.includes(this.getMethodName())) {
					let res = await uniIdCommon.createInstance({clientInfo: this.clientInfo})
																		 .checkToken(this.clientInfo.uniIdToken)
					// console.log('checkToken res',res);
					if (res.errCode) {
					  // 如果token校验出错，则抛出错误
					  throw res
					}
					// token 有效，取出 id 和角色
					this.current_uid = res.uid
					this.current_user_role = res.role || []
					
					// 如果有新的 token，则返回给客户端。实现自动续期
					const {token,tokenExpired} = res
					this.hasNewToken = token ? {token,tokenExpired} : false
					
					// todo:临时禁用IM的用户，临时方案用于突发情况。当用户二次登录时，role会自动带disable_im
					const tmpBlackUid = []
					if (res.role.includes('disable_im') || tmpBlackUid.includes(res.uid)) {
					  // 如果用户被禁用IM，则抛出错误
					  throw {
					    errSubject: 'uni-im-co',
					    errCode: 'USER_DISABLED_IM',
					    errMsg: '你的账号，已被禁止使用uni-im'
					  }
					}
				}
			}
		}
		
		await verifyRequestAndSetInfo[source].call(this)
		
		console.log(`
			#####本次请求的
			来源：${source}
			用户信息：${JSON.stringify({uid:this.current_uid,role:this.current_user_role})}
			客户端信息：${JSON.stringify(this.clientInfo)}
			参数：${JSON.stringify(this.getParams())}
			方法名：${this.getMethodName()}
		`)
		
		
		// 调用扩展插件的初始化接口
		const { invokeExts } = require('uni-im-ext')
		await invokeExts('ext-init',this.clientInfo)
		
		// 为方便云对象内部调用 sendPushMsg() 方法，把它挂在云对象实例上
		this.sendPushMsg = modelObj.sendPushMsg
		// _promises，用于添加并发任务
		this._promises = []
		this.addPromise = (promise) => {
		  this._promises.push(promise)
		}
  },

  async _after(error, result) {
    // 请求完成时间
    // console.error('请求完成时间', Date.now() - this.requestStartTime, 'ms')
    
    if (error) {
      console.error( '云对象_after发现错误' + error.message,JSON.stringify({error,result}) );
      console.error({
        "getMethodName":this.getMethodName(),
        "getParams":this.getParams(),
        "getClientInfo":this.getClientInfo()
      });
      console.error(error.stack)
      if (error.errCode && error.errMsg) {
        // 符合响应体规范的错误，直接返回
        return error
      } else {
        return {
          errSubject: "uni-im-co",
          errCode: "unicloud throw error",
          errMsg: error.message
        }
      }
    }

    // 如果有并发任务，则等它们都执行完再返回
    if (this._promises.length > 0) {
      await Promise.all(this._promises)
    }

    // console.error('云函数结束时间', Date.now() - this.requestStartTime, 'ms')

		if (this.hasNewToken) {
			// console.error('this.hasNewToken',this.hasNewToken)
			// 返回新的 token
			result.newToken = this.hasNewToken
		}
    return result || { errCode: 0 }
  }
}
