"use strict";
const common_vendor = require("../../../../common/vendor.js");
const onSocketStateChange = (callback) => {
  let socketOpenIndex = 0;
  common_vendor.index.onSocketOpen(() => {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onSocketStateChange.js:5", "WebSocket 连接已打开！");
    socketOpenIndex++;
    callback(true, socketOpenIndex);
  });
  common_vendor.index.onSocketClose(() => {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onSocketStateChange.js:11", "WebSocket 已关闭！");
    callback(false, socketOpenIndex);
  });
};
exports.onSocketStateChange = onSocketStateChange;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/onSocketStateChange.js.map
