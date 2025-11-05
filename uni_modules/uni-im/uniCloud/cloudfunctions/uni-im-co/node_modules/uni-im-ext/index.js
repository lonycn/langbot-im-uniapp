/**
 * 本模块实现一个云端的扩展机制：
 * 
 * 本模块作为一个公共模块打包部署到云服务空间，启动时会动态扫描同级的目录（都是公共模块），
 * 发现符合要求的模块则作为扩展模块导入，并可以通过 `invokeExts()` 接口来调用。
 * 
 * 扩展模块需符合下面这些条件：
 * 
 * - 本身需要是一个公共模块，这样才能最终被打包到本模块的同级目录下。
 * 
 * - 模块的 `package.json` 里面通过设置 `uni-im-ext` 属性来标记为一个扩展模块，属性值为一个扩展配置对象，
 *   包含一个名为 `extensions` 的属性，把所支持的扩展点映射到该模块的某个导出方法。
 * 
 * - 模块要被某个已有模块所依赖，这样才能确保在打包的时候带上，推荐设置为被本模块（uni-im-ext）所依赖。
 * 
 * @module uni-im-ext
 */

// 目前已支持的扩展点如下：

/**
 * 云端扩展点：在消息被发送之前检查息内容是否合法。
 * @callback validate-msg
 * @param params {Object} 将要发送的消息。
 * @param coInst {Object} 当前的云对象实例。
 * @returns {boolean|undefined} true 表示合法，false 表示不合法，undefined 表示未定。
 */

/**
 * 云端扩展点：msg 即将被发送。
 * @callback send-msg
 * @param msgData {Object} 将要发送的消息。
 * @param coInst {Object} 当前的云对象实例。
 */

/**
 * 云端扩展点：创建新群之前。扩展程序可以修改群成员列表。
 * @callback before-create-group
 * @param user_ids {string[]} 新群中的用户。
 * @param coInst {Object} 当前的云对象实例。
 */

/**
 * 云端扩展点：推送消息通知。
 * @callback push-msg-notify
 * @param notify {Object} 将要推送的消息。
 * @param notify.to_uids {string[]} 目标用户。
 * @param notify.msg {Object} 消息内容。
 */

/**
 * 云端扩展点：扩展程序可以注册一种新的消息类型，并提供相应的 hooks 执行处理逻辑。
 * @callback msg-type-register
 * @returns {MsgTypeOptions}
 */

/**
 * @typedef MsgTypeOptions
 * @type {object}
 * @property {string} type - 消息类型。
 * @property {function} [isReadable] - 消息是否可见。缺省相当于直接返回 true。
 * @property {function} [noPersistent] - 消息是否需要保存到数据库。缺省相当于直接返回 false。
 * @property {function} [noPushOffline] - 消息推送时是否需要厂商通道（离线也能推送）。缺省相当于直接返回 false。
 * @property {function} [beforeSendMsg] - 消息在云端消息入库之前的 hook 处理。
 */

const fs = require('fs');
const path = require('path');
const REGISTER_EXT_CACHE = './_registered_ext.js'
let isFsWritable = false

function getSubdirs(parent) {
  try {
    return fs.readdirSync(parent)
      .filter(subdir => {
        let fullpath = path.join(parent, subdir)
        let stats = fs.statSync(fullpath)
        return stats.isDirectory()
      })
  } catch (e) {
    return []
  }
}

/**
 * 扫描找到所有公共模块，加载其中的扩展模块。
 */
function loadExtensions() {
  // 本模块是公共模块，其所在目录的上级目录，为公共模块的根目录（开发环境例外）
  let commonDir = path.dirname(__dirname)
  let modDirs = getSubdirs(commonDir).map(subdir => path.join(commonDir, subdir))

  // 在公有云环境中，commonDir 为 <space_dir>/@common_modules，这里包含了当前云函数/云对象所依赖的公共模块
  //
  // 在私有云环境中，commonDir 为 <space_dir>/common，这里包含了所有云函数/云对象所依赖的公共模块
  //
  // 在 HX 开发环境中，commonDir 为本模块（uni-im-ext）所在的目录，而其它公共模块都还在自己的源代码目录中
  if (process.env['UNICLOUD_DEBUGGER_PATH']) {
    // 要找到主项目中所有的公共模块
    modDirs = []

    // 沿着路径向上找到 uni_modules 目录（uni_modules/uni-im/uniCloud/cloudfunctions/common/uni-im-ext）
    let uniModulesRoot = commonDir
    while (true) {
      if (path.basename(uniModulesRoot) === 'uni_modules') break
      let parentDir = path.dirname(uniModulesRoot)
      if (parentDir === uniModulesRoot) break
      uniModulesRoot = parentDir
    }

    // 找到了 uni_modules
    if (path.basename(uniModulesRoot) === 'uni_modules') {
      // 遍历其中的每个 uni_module，查找出其中的公共模块
      let uniModuleDirs = getSubdirs(uniModulesRoot).map(subdir => path.join(uniModulesRoot, subdir))

      for (let uniModuleDir of uniModuleDirs) {
        let commonDir = path.join(uniModuleDir, 'uniCloud/cloudfunctions/common')
        let _modDirs = getSubdirs(commonDir).map(subdir => path.join(commonDir, subdir))
        modDirs.push(..._modDirs)
      }

      // uni_modules 的父目录是主项目根目录
      // 遍历其中的云空间目录（uniCloud-*），查找出其中的公共模块
      let projectRoot = path.dirname(uniModulesRoot)
      let uniCloudDirs = getSubdirs(projectRoot)
        .filter(subdir => subdir.startsWith('uniCloud-'))
        .map(subdir => path.join(projectRoot, subdir))

      for (let uniCloudDir of uniCloudDirs) {
        let commonDir = path.join(uniCloudDir, 'cloudfunctions/common')
        let _modDirs = getSubdirs(commonDir).map(subdir => path.join(commonDir, subdir))
        modDirs.push(..._modDirs)
      }
    }
  }

  let registeredExtensionPoints = {}
  let requires = []
  let moduleExports = {}
  let extSeq = 0

  for (let modDir of modDirs) {
    // 遍历每个公共模块目录，解析其 package.json 文件
    let packageFile = path.join(modDir, 'package.json')
    let packageContent = fs.readFileSync(packageFile, { encoding: 'utf8' })
    let packageJson = JSON.parse(packageContent)

    // 识别扩展模块的标记
    if (typeof packageJson['uni-im-ext'] !== 'object') continue

    // 导入模块
    let exports = require(modDir)
    let { extensions = {} } = packageJson['uni-im-ext']
    for (let extPoint of Object.keys(extensions)) {
      let ext = exports[extensions[extPoint]]
      if (typeof ext !== 'function') {
        console.error(`扩展模块加载错误，没有指定的接口方法：${extPoint}: ${extensions[extPoint]}`)
        continue
      }
      registeredExtensionPoints[extPoint] = registeredExtensionPoints[extPoint] || []
      registeredExtensionPoints[extPoint].push(ext)

      moduleExports[extPoint] = moduleExports[extPoint] || []
      moduleExports[extPoint].push(`e_${extSeq}.${extensions[extPoint]}`)
    }

    requires.push(`const e_${extSeq} = require('${modDir.replace(/\\/g, '/')}');`)
    extSeq ++
  }

  // 把扫描到的扩展模块写入缓存文件
  if (isFsWritable) {
    moduleExports = Object.keys(moduleExports).map(exp => {
      return `"${exp}": [${moduleExports[exp].join(', ')}]`
    }).join(',\n')

    try {
      // 输出缓存文件
      let registeredExtCache = `
${requires.join('\n')}
module.exports = {
${moduleExports}
}
`
      fs.writeFileSync(path.join(__dirname, REGISTER_EXT_CACHE), registeredExtCache)
    } catch (e) {
      // 无法写缓存文件？
    }
  }

  return registeredExtensionPoints
}

let _registeredExtensionPointsPromise

/**
 * 调用一个扩展点上挂接的所有扩展程序。
 * @param name {String} 扩展点名称
 * @param args {any[]} 调用参数
 * @returns {any[]} 该扩展点上挂接的所有扩展程序各自的返回值拼装在一个数组里。
 */
async function invokeExts(extensionPointName, ...args) {
  const [{ provider }] = uniCloud.getCloudInfos()
  isFsWritable = (provider === 'aliyun')

  // 尝试从生成的缓存文件中加载
  let registeredExtensionPoints
  if (isFsWritable) {
    try {
      registeredExtensionPoints = require(REGISTER_EXT_CACHE)
    } catch (e) {
      // 尚未生成缓存文件
    }
  }

  if (!registeredExtensionPoints) {
    // 懒加载，避免在调用接口重入时重复解析扩展模块
    if (!_registeredExtensionPointsPromise) {
      _registeredExtensionPointsPromise = new Promise(resolve => {
        resolve(loadExtensions())
      })
    }
    registeredExtensionPoints = await _registeredExtensionPointsPromise
  }
  // console.log('invokeExts:', Object.keys(registeredExtensionPoints), extensionPointName, args)

  // 找到指定的扩展点并调用
  if (!registeredExtensionPoints[extensionPointName]) return []
  const AsyncFunction = invokeExts.constructor
  return Promise.all(
    registeredExtensionPoints[extensionPointName]
      .map(ext => {
        if (ext instanceof AsyncFunction) {
          return ext.call(null, ...args).catch(() => false)
        } else {
          try {
            return ext.call(null, ...args)
          } catch(e) {
            console.error('扩展点抛出的异常',e)
            return false
          }
        }
      })
  )
}

let _registeredMsgTypes

let msgTypes = {
  async getAll() {
    if (!_registeredMsgTypes) {
      // 调用扩展点，扩展程序可以注册新的消息类型。
      let exts = await invokeExts('msg-type-register')
      let registeredMsgTypes = {}
      for (let ext of exts) {
        if (registeredMsgTypes[ext.type]) {
          console.error('重复注册的消息类型：' + ext.type)
        }
        registeredMsgTypes[ext.type] = ext
      }
      _registeredMsgTypes = registeredMsgTypes
    }
    return _registeredMsgTypes
  },

  // 根据消息类型获取对应的扩展对象
  async get(type) {
    let registeredMsgTypes = await msgTypes.getAll()
    return registeredMsgTypes[type]
  },
}

module.exports = {
  invokeExts,
  msgTypes,
}

