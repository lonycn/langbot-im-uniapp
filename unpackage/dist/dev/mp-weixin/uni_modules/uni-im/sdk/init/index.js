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
const uni_modules_uniIm_sdk_methods_index = require("../methods/index.js");
const uni_modules_uniIm_sdk_ext_index = require("../ext/index.js");
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const uni_modules_uniIm_sdk_init_checkVersion = require("./checkVersion.js");
const uni_modules_uniIm_sdk_init_onAppActivateStateChange = require("./onAppActivateStateChange.js");
const uni_modules_uniIm_sdk_init_onNotification = require("./onNotification.js");
const uni_modules_uniIm_sdk_init_clearData = require("./clearData.js");
const uni_modules_uniIm_sdk_init_msgEvent = require("./msgEvent.js");
const uni_modules_uniIm_sdk_init_getCloudMsg = require("./getCloudMsg.js");
const uni_modules_uniIm_sdk_init_onSocketStateChange = require("./onSocketStateChange.js");
const uni_modules_uniIm_sdk_init_imData = require("./imData.js");
const uni_modules_uniIm_sdk_init_onlyOneWebTab = require("./onlyOneWebTab.js");
const modules = {
  checkVersion: uni_modules_uniIm_sdk_init_checkVersion.checkVersion,
  onAppActivateStateChange: uni_modules_uniIm_sdk_init_onAppActivateStateChange.onAppActivateStateChange,
  clearData: uni_modules_uniIm_sdk_init_clearData.clearData,
  msgEvent: uni_modules_uniIm_sdk_init_msgEvent.msgEvent,
  getCloudMsg: uni_modules_uniIm_sdk_init_getCloudMsg.getCloudMsg,
  onSocketStateChange: uni_modules_uniIm_sdk_init_onSocketStateChange.onSocketStateChange,
  imData: uni_modules_uniIm_sdk_init_imData.imData,
  onlyOneWebTab: uni_modules_uniIm_sdk_init_onlyOneWebTab.onlyOneWebTab,
  onNotification: uni_modules_uniIm_sdk_init_onNotification.onNotification
};
const version = "3.0.0";
function init(initParam) {
  return __async(this, null, function* () {
    modules.checkVersion(version);
    uni_modules_uniIm_sdk_methods_index.methods.msgTypes.registerTypes();
    if (uni_modules_uniIm_sdk_state_index.state.currentUser.tokenExpired > Date.now()) {
      yield modules.imData.init();
    } else {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/index.js:105", "登录状态过期，暂不初始化数据");
    }
    common_vendor.index.$on("uni-id-pages-login-success", () => __async(this, null, function* () {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/index.js:109", "登录成功，开始初始化数据");
      modules.imData.init();
    }));
    modules.imData.onInitAfter(() => {
      const uniImCo = common_vendor.tr.importObject("uni-im-co");
      uniImCo.getUnreadCount().then(({ data }) => {
        uni_modules_uniIm_sdk_state_index.state.conversation.cloudUnreadCountObj = data.unreadCountObj;
      }).catch((e) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/index.js:123", "读取云端未读会话数据失败", e);
      });
      common_vendor.index.offPushMessage(onPushMsg);
      common_vendor.index.onPushMessage(onPushMsg);
    });
    function onPushMsg(res) {
      switch (res.data.payload.type) {
        case "uni-im":
          modules.msgEvent.emitMsg(res);
          break;
        case "uni-im-notification":
          modules.onNotification(res);
          break;
      }
    }
    modules.onSocketStateChange((state, count) => {
      this.socketConnectState = state;
      if (count > 1) {
        modules.getCloudMsg();
      }
    });
    modules.onAppActivateStateChange((state, count) => {
      var _a;
      this.appActivateState = state;
      if (!state)
        return;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const isLoginPage = currentPage == null ? void 0 : currentPage.route.includes("uni_modules/uni-id-pages/pages/login");
      const { tokenExpired } = uni_modules_uniIm_sdk_state_index.state.currentUser;
      if (!((_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.oauthToken) && !isLoginPage && count > 1 && tokenExpired < Date.now()) {
        common_vendor.index.__f__("info", "at uni_modules/uni-im/sdk/init/index.js:184", "uni-im检测到，当前用户登录过且当前登录状态已过期，将自动跳转至登录页面。");
        common_vendor.index.reLaunch({
          url: "/uni_modules/uni-id-pages/pages/login/login-withpwd",
          complete(e) {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/index.js:188", "uni.reLaunch to login page", e);
          }
        });
      }
    });
    common_vendor.index.$on("uni-id-pages-logout", () => modules.clearData());
    uni_modules_uniIm_sdk_state_index.state.onMsg = modules.msgEvent.onMsg;
    uni_modules_uniIm_sdk_state_index.state.offMsg = modules.msgEvent.offMsg;
    uni_modules_uniIm_sdk_state_index.state.keyboardMaxHeight = common_vendor.index.getStorageSync("uni-im-data-keyboard-max-height") || 0;
    setInterval(() => {
      uni_modules_uniIm_sdk_state_index.state.heartbeat = Date.now();
    }, 1e3);
    const audioContext = common_vendor.index.createInnerAudioContext();
    let _audioContext = {};
    Object.defineProperty(_audioContext, "src", {
      set(url) {
        audioContext.src = url;
      },
      get() {
        return audioContext.src;
      }
    });
    uni_modules_uniIm_sdk_state_index.state.audioContext = new Proxy(_audioContext, {
      get(target, propKey, receiver) {
        return audioContext[propKey];
      }
    });
    uni_modules_uniIm_sdk_state_index.state.systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.index.getSystemInfo({
      success: (res) => {
        uni_modules_uniIm_sdk_state_index.state.systemInfo = res;
      },
      fail: (e) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/index.js:282", "获取系统信息失败", e);
      }
    });
    if (uni_modules_uniIm_sdk_state_index.state.systemInfo.deviceType === "pc") {
      uni_modules_uniIm_sdk_state_index.state.isWidescreen = true;
      uni_modules_uniIm_sdk_state_index.state.isTouchable = false;
    } else {
      uni_modules_uniIm_sdk_state_index.state.isWidescreen = uni_modules_uniIm_sdk_state_index.state.systemInfo.screenWidth >= 960;
      uni_modules_uniIm_sdk_state_index.state.isTouchable = true;
    }
    let list = ["navigateTo", "redirectTo", "reLaunch", "switchTab", "navigateBack"];
    list.forEach((item) => {
      common_vendor.index.addInterceptor(item, {
        success: (event) => {
          updateTabBarBadge();
        }
      });
    });
    common_vendor.wx$1.onAppRoute((res) => {
      updateTabBarBadge();
    });
    function updateTabBarBadge() {
      setTimeout(() => {
        let unread_count = uni_modules_uniIm_sdk_state_index.state.notification.unreadCount();
        uni_modules_uniIm_sdk_utils_index.utils.setTabBarBadge(2, unread_count);
        unread_count = uni_modules_uniIm_sdk_state_index.state.conversation.unreadCount();
        uni_modules_uniIm_sdk_utils_index.utils.setTabBarBadge(0, unread_count);
      }, 300);
    }
    common_vendor.index.addInterceptor("previewImage", {
      invoke: (e) => {
      },
      success: (res) => {
      }
    });
    uni_modules_uniIm_sdk_utils_index.utils.appEvent.onAppActivate(() => {
      uni_modules_uniIm_sdk_state_index.state.ext.appIsActive = true;
    });
    uni_modules_uniIm_sdk_utils_index.utils.appEvent.onAppDeactivate(() => {
      uni_modules_uniIm_sdk_state_index.state.ext.appIsActive = false;
    });
    function doLogin(param) {
      return __async(this, null, function* () {
        if (param.login) {
          try {
            param.login = JSON.parse(param.login);
            yield uni_modules_uniIm_sdk_ext_index.ext.login(param.login);
          } catch (error) {
          }
        }
      });
    }
    uni_modules_uniIm_sdk_methods_index.methods.extensions.installExt("index-load-before-extra", doLogin);
    uni_modules_uniIm_sdk_methods_index.methods.extensions.installExt("chat-load-before-extra", doLogin);
  });
}
exports.init = init;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/index.js.map
