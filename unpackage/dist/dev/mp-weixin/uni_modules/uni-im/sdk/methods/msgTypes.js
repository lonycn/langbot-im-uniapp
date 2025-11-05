"use strict";
const common_vendor = require("../../../../common/vendor.js");
require("../state/index.js");
const uni_modules_uniIm_sdk_methods_extensions = require("./extensions.js");
let registeredTypes = {};
const msgTypes = {
  registerTypes() {
    let exts = uni_modules_uniIm_sdk_methods_extensions.$extensions.invokeExts("msg-type-register");
    for (let ext of exts) {
      if (registeredTypes[ext.type]) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/methods/msgTypes.js:12", "重复注册的消息类型：" + ext.type);
      }
      registeredTypes[ext.type] = ext;
    }
  },
  // 根据消息类型获取对应的扩展对象
  get(type) {
    return registeredTypes[type];
  }
};
exports.msgTypes = msgTypes;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/methods/msgTypes.js.map
