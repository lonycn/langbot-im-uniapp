"use strict";
const uni_modules_uniIm_sdk_init_index = require("./init/index.js");
const uni_modules_uniIm_sdk_methods_index = require("./methods/index.js");
const uni_modules_uniIm_sdk_state_index = require("./state/index.js");
const uni_modules_uniIm_sdk_utils_index = require("./utils/index.js");
const uni_modules_uniIm_sdk_ext_index = require("./ext/index.js");
const uniIm = uni_modules_uniIm_sdk_utils_index.utils.deepAssign(uni_modules_uniIm_sdk_state_index.state, uni_modules_uniIm_sdk_methods_index.methods, { init: uni_modules_uniIm_sdk_init_index.init, utils: uni_modules_uniIm_sdk_utils_index.utils }, uni_modules_uniIm_sdk_ext_index.ext, {
  mapState(keys = []) {
    let obj = {};
    keys.forEach((key) => {
      let keyName = key, keyCName = false;
      if (key.includes(" as ")) {
        let _key = key.trim().split(" as ");
        keyName = _key[0];
        keyCName = _key[1];
      }
      obj[keyCName || keyName] = function() {
        return uni_modules_uniIm_sdk_state_index.state[keyName];
      };
    });
    return obj;
  }
});
exports.uniIm = uniIm;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/index.js.map
