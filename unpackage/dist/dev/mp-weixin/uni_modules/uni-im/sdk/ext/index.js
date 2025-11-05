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
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
const uni_modules_uniIdPages_common_store = require("../../../uni-id-pages/common/store.js");
const ext = {
  toChat(param) {
    if (uni_modules_uniIm_sdk_state_index.state.isWidescreen) {
      common_vendor.index.$emit("uni-im-toChat", param);
    } else {
      let url = "/uni_modules/uni-im/pages/chat/chat?";
      for (let key in param) {
        let value = param[key];
        if (typeof value === "object") {
          value = decodeURIComponent(JSON.stringify(value));
        }
        url += key + "=" + value + "&";
      }
      common_vendor.index.navigateTo({ url, animationDuration: 300 });
    }
  },
  login(param) {
    return __async(this, null, function* () {
      const uniImCo = common_vendor.tr.importObject("uni-im-co");
      const res = yield uniImCo.login(param);
      if (res.errCode) {
        return common_vendor.index.showModal({
          content: JSON.stringify(res),
          showCancel: false
        });
      }
      uni_modules_uniIdPages_common_store.mutations.loginSuccess({
        autoBack: false,
        showToast: false
      });
      return res;
    });
  },
  logout() {
    return __async(this, null, function* () {
      yield uni_modules_uniIdPages_common_store.mutations.logout();
    });
  }
};
exports.ext = ext;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/ext/index.js.map
