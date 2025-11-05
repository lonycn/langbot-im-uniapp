"use strict";
const uni_modules_uniIm_sdk_methods_users = require("./users.js");
const uni_modules_uniIm_sdk_methods_notification = require("./notification.js");
const uni_modules_uniIm_sdk_methods_extensions = require("./extensions.js");
const uni_modules_uniIm_sdk_methods_msgTypes = require("./msgTypes.js");
const methods = {
  users: uni_modules_uniIm_sdk_methods_users.$users,
  notification: uni_modules_uniIm_sdk_methods_notification.notification,
  extensions: uni_modules_uniIm_sdk_methods_extensions.$extensions,
  msgTypes: uni_modules_uniIm_sdk_methods_msgTypes.msgTypes
};
exports.methods = methods;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/methods/index.js.map
