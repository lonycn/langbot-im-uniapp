const crypto = require('crypto');
const SymmetricEncryption = require('./SymmetricEncryption.class.js');
const db = uniCloud.database()
const dbCmd = db.command
const $ = dbCmd.aggregate
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

function getConfig(key) {
  // 获取 uni-im 配置
  const createConfig = require("uni-config-center");
  const uniImConfig = createConfig({
    pluginId: 'uni-im', // 插件 id
  })
  return uniImConfig.config(key)
}

function getConversationId({
  group_id,
  from_uid,
  to_uid,
}) {
  if (group_id) {
    return `group_${group_id}`
  }
  let arr = [from_uid, to_uid]
  return 'single' + '_' + md5(arr.sort().toString())
}

function hideUsernameStr(username) {
  if (username == undefined) {
    return false
  }
  let length = username.length
  let n = parseInt(length / 2.5) * 2
  return username.substr(0, length - n) + '**' + username.substr(-1 * n / 2)
}

function hideEmailStr(email) {
  if (email == undefined) {
    return ''
  }
  const content = email.split("@")
  return content[0].substr(0, content[0].length - 2) + '**' + content[1]
}

function hideMobileStr(mobile) {
  if (mobile == undefined) {
    return ''
  }
  return mobile.substr(0, 3) + '****' + mobile.substr(-1 * 4)
}

function checkParam(params, rule) {
  rule.required.forEach(item => {
    if (!params[item]) {
      throw new Error('错误，参数：' + item + "的值不能为空")
    }
  })
  for (let key in rule.type) {
    if (key in rule.type) {
      let val = params[key]
      let types = rule.type[key]

      function parseType(data) {
        return Object.prototype.toString.call(data).replace(/[\[\]]/g, '').split(' ')[1]
      }

      if (val && !types.includes(parseType(val))) {
        throw new Error('错误，参数：' + key + '的数据类型必须为：' + types.join('或'))
      }
    }
  }
}

const SEN = new SymmetricEncryption()
const encrypt = str => SEN.encrypt(str)
const decrypt = str => SEN.decrypt(str)
module.exports = {
  db,
  dbCmd,
  $,
  md5,
  encrypt,
  decrypt,
  getConversationId,
  hideUsernameStr,
  hideEmailStr,
  hideMobileStr,
  checkParam,
  getConfig
}