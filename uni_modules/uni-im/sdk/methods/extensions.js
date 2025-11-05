import $state from '../state/index.js';
let registeredExtensionPoints = {}// $state.ext._extensionPoints

/**
 * 由扩展模块调用，在指定的扩展点上挂接一个扩展程序。
 * @param {String} extensionPointName 扩展点名称。
 * @param {Function|Object} ext 扩展实现，可以是一个 Function，也可以是一个包含 extension() 方法的 Object。
 */
function installExt(extensionPointName, ext) {
  registeredExtensionPoints[extensionPointName] = registeredExtensionPoints[extensionPointName] || []
  registeredExtensionPoints[extensionPointName].push(ext)
}

/**
 * 检查在指定的扩展点上是否挂接了扩展程序。
 * @param {String} extensionPointName 扩展点名称。
 * @returns {boolean} true 表示安装了扩展程序。
 */
function hasExt(extensionPointName) {
  return registeredExtensionPoints[extensionPointName]
      && registeredExtensionPoints[extensionPointName].length > 0
}

/**
 * 调用一个扩展点上挂接的所有扩展程序，按照挂接安装的顺序来调用。
 * 
 * 入口参数和返回值都由调用方负责约定，此接口只负责透传。
 * 
 * @param extensionPointName {String} 扩展点名称
 * @param args {any[]} 调用参数
 * @returns {any[]} 所有扩展程序的返回值按顺序组装在一个数组中返回。如果扩展点上挂接的扩展程序是异步函数，则返回值为相应的 Promise 对象。
 */
function invokeExts(extensionPointName, ...args) {
  if (!registeredExtensionPoints[extensionPointName]) return []
  let results = []
  for (let ext of registeredExtensionPoints[extensionPointName]) {
    let result
    if (typeof ext === 'function') {
      result = ext.call(null, ...args)
    } else if (typeof ext === 'object' && typeof ext.extension === 'function') {
      result = ext.extension.call(ext, ...args)
    }
    results.push(result)
  }
  return results
}

/**
 * 扩展程序框架。
 * @module extensions
 */
export default {
  installExt,
  hasExt,
  invokeExts,
}

// 目前已支持的扩展点如下：

/**
 * 前端扩展点：更新未读消息总数。
 * @external ui-update-unread-count
 */

/**
 * 前端扩展点：决定标题条是否要闪烁。
 * @external ui-flash-title-bar
 */

/**
 * 前端扩展点：申请弹出消息通知的权限。
 * @external ui-notification-permission
 */

/**
 * 前端扩展点：弹出的消息通知被用户点击。
 * @external ui-notification-clicked
 */

/**
 * 前端扩展点：用户敲了 ESC 键。
 * @external ui-esc
 */

/**
 * 前端扩展点：收到了新消息。
 * @external ui-new-message
 */

/**
 * 前端扩展点：在会话列表中渲染每个会话时会调用此扩展点，扩展程序可以为该会话增加覆盖的图标元素。
 * @external conversation-avatar-overlay
 */

/**
 * 前端扩展点：在会话列表中渲染每个群聊会话时会调用此扩展点，扩展程序可以为该会话增加 tag。
 * @external conversation-tags
 */

/**
 * 前端扩展点：扩展程序可以注册一种新的消息类型，并提供相应的 hooks 执行处理逻辑。
 * @see MsgTypeOptions
 * @external msg-type-register
 */

/**
* 前端扩展点：在消息列表某条消息进入显示区时会调用此扩展点。
* @external msg-appear
*/

/**
* 前端扩展点：在消息列表某条消息离开显示区时会调用此扩展点。
* @external msg-disappear
*/

/**
* 前端扩展点：在渲染每条消息时会调用此扩展点，扩展程序可以返回扩展组件，为该消息增加一些显示元素。
* @external msg-extra
*/

/**
 * 前端扩展点：扩展程序可以在 web-pc 端的消息输入框新增一个工具类的项。
 * @external input-msg-tool-bar
 */

/**
 * @typedef MsgTypeOptions
 * @type {object}
 * @property {string} type - 消息类型。
 * @property {function} isReadable - 消息是否可见。
 * @property {function} [beforeLocalAdd] - 消息在本地保存之前的 hook 处理。
 */
