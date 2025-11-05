const {verifyHttpInfo} = require('uni-cloud-s2s')
module.exports = function beforeHttp(modules){
  // console.log('this.getClientInfo()',this.getClientInfo())
	
  // 校验 HTTP 请求是否合法
  verifyHttpInfo(this.getHttpInfo())
  
  // 获取 HTTP 请求参数
  const [param,options = {}] = getHttpParams.call(this)
	
  // 获取模拟操作的用户的信息
  const {userInfo,clientInfo} = options
	if (userInfo){
		// 用户id 用户角色
		this.current_uid = userInfo._id
		this.current_user_role = userInfo.role || []
	}
  // 设置客户端信息，例如设置客户端appid
  if (clientInfo){
    this.clientInfo = Object.assign(this.getClientInfo(),clientInfo)
  }
	this.getParams()[0] = param
}

function getHttpParams(){
  // 获取 HTTP 请求参数
  let params = this.getHttpInfo().body
	console.error('1111111111getHttpParams params',params)
  // 尝试地将参数转换为 JSON 对象
  try {
    params = JSON.parse(params)
  } catch (_) {
		throw {
			errCode: 'params-error',
			errMsg: '参数错误：无法解析为JSON字符串'
		}
	}
	// 如果参数不是数组，则转换为数组
	if (!Array.isArray(params)) {
		params = [params]
	}
	console.error('22222222getHttpParams params',params)
  return params
}