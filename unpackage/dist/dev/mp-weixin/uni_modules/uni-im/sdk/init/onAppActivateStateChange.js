"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const uni_modules_uniIm_sdk_utils_appEvent = require("../utils/appEvent.js");
function onAppActivateStateChange(callback) {
  let onAppActivateIndex = 0;
  uni_modules_uniIm_sdk_utils_appEvent.appEvent.onAppActivate(() => __async(this, null, function* () {
    onAppActivateIndex++;
    callback(true, onAppActivateIndex);
  }));
  uni_modules_uniIm_sdk_utils_appEvent.appEvent.onAppDeactivate(() => __async(this, null, function* () {
    callback(false, onAppActivateIndex);
  }));
}
exports.onAppActivateStateChange = onAppActivateStateChange;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/onAppActivateStateChange.js.map
