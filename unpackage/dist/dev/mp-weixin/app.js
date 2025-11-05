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
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const uni_modules_uniIdPages_init = require("./uni_modules/uni-id-pages/init.js");
const uni_modules_uniIm_sdk_index = require("./uni_modules/uni-im/sdk/index.js");
const uni_modules_uniImMsgReader_extension = require("./uni_modules/uni-im-msg-reader/extension.js");
if (!Math) {
  "./pages/chat/chat.js";
  "./pages/index/index.js";
  "./uni_modules/uni-im/pages/index/index.js";
  "./uni_modules/uni-im/pages/common/view-code-page/view-code-page.js";
  "./uni_modules/uni-im/pages/userList/userList.js";
  "./uni_modules/uni-im/pages/chat/chat.js";
  "./uni_modules/uni-im/pages/common/video/video.js";
  "./uni_modules/uni-im/pages/group/info.js";
  "./uni_modules/uni-im/pages/contacts/notification/notification.js";
  "./uni_modules/uni-im/pages/contacts/contacts.js";
  "./uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.js";
  "./uni_modules/uni-im/pages/contacts/createGroup/createGroup.js";
  "./uni_modules/uni-im/pages/group/qrCode.js";
  "./uni_modules/uni-im/pages/contacts/groupList/groupList.js";
  "./uni_modules/uni-im/pages/chat/info.js";
  "./uni_modules/uni-im/pages/share-msg/share-msg.js";
  "./uni_modules/uni-im/pages/group/members.js";
  "./uni_modules/uni-im/pages/group/notice/list.js";
  "./uni_modules/uni-im/pages/group/notice/edit.js";
  "./uni_modules/uni-id-pages/pages/userinfo/userinfo.js";
  "./uni_modules/uni-id-pages/pages/login/login-withoutpwd.js";
  "./uni_modules/uni-id-pages/pages/login/login-withpwd.js";
  "./uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate.js";
  "./uni_modules/uni-id-pages/pages/userinfo/bind-mobile/bind-mobile.js";
  "./uni_modules/uni-id-pages/pages/login/login-smscode.js";
  "./uni_modules/uni-id-pages/pages/register/register.js";
  "./uni_modules/uni-id-pages/pages/retrieve/retrieve.js";
  "./uni_modules/uni-id-pages/pages/common/webview/webview.js";
  "./uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd.js";
  "./uni_modules/uni-id-pages/pages/register/register-by-email.js";
  "./uni_modules/uni-id-pages/pages/retrieve/retrieve-by-email.js";
  "./uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd.js";
}
console.time = function(name) {
};
console.timeEnd = function(name, fun) {
};
const _sfc_main = {
  onLaunch: function() {
    return __async(this, null, function* () {
      common_vendor.index.__f__("log", "at App.vue:35", "App Launch");
      uni_modules_uniImMsgReader_extension.MsgReaderExtension.install();
      uni_modules_uniIdPages_init.uniIdPagesInit();
      uni_modules_uniIm_sdk_index.uniIm.init();
    });
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:44", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:47", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
