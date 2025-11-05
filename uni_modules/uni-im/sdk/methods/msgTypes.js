import $state from '../state/index.js'
import $extensions from '../methods/extensions.js';

let registeredTypes = {}

const msgTypes = {
  registerTypes() {
    // 调用扩展点，扩展程序可以注册新的消息类型。
    let exts = $extensions.invokeExts('msg-type-register')
    for (let ext of exts) {
      if (registeredTypes[ext.type]) {
        console.error('重复注册的消息类型：' + ext.type)
      }
      registeredTypes[ext.type] = ext
    }
  },

  // 根据消息类型获取对应的扩展对象
  get(type) {
    return registeredTypes[type]
  }
}

export default msgTypes
