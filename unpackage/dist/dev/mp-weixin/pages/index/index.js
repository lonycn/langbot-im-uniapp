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
const common_vendor = require("../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../uni_modules/uni-im/sdk/index.js");
const _sfc_main = {
  computed: {
    unreadMsgCount() {
      return uni_modules_uniIm_sdk_index.uniIm.conversation.unreadCount();
    },
    notificationUnreadCount() {
      return uni_modules_uniIm_sdk_index.uniIm.notification.unreadCount();
    }
  },
  data() {
    return {};
  },
  onReady() {
    return __async(this, null, function* () {
    });
  },
  methods: {
    //未读系统通知数量
    toPath(path) {
      common_vendor.index.navigateTo({
        url: path,
        fail: () => {
          common_vendor.index.switchTab({
            url: path,
            fail: (e) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:48", e);
            }
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.toPath("/uni_modules/uni-im/pages/index/index")),
    b: common_vendor.p({
      title: "uni-im 会话列表",
      link: true,
      ["show-badge"]: $options.unreadMsgCount > 0,
      ["badge-text"]: $options.unreadMsgCount + "",
      ["badge-style"]: {
        "background": "#f41500"
      }
    }),
    c: common_vendor.o(($event) => $options.toPath("/uni_modules/uni-im/pages/userList/userList")),
    d: common_vendor.p({
      title: "用户列表",
      link: true
    }),
    e: common_vendor.o(($event) => $options.toPath("/uni_modules/uni-im/pages/contacts/contacts")),
    f: common_vendor.p({
      title: "通讯录",
      link: true,
      ["show-badge"]: $options.notificationUnreadCount > 0,
      ["badge-text"]: $options.notificationUnreadCount + "",
      ["badge-style"]: {
        "background": "#f41500"
      }
    }),
    g: common_vendor.o(($event) => $options.toPath("/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true")),
    h: common_vendor.p({
      title: "个人中心",
      link: true
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
