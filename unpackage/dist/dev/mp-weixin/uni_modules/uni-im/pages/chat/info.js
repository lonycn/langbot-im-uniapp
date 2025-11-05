"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const db = common_vendor.tr.database();
const _sfc_main = {
  data() {
    let UserinfoMenu = uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("userinfo-menu-extra").filter((result) => result && result.component).map((result) => {
      return {
        component: common_vendor.markRaw(result.component),
        props: result.props
      };
    });
    return {
      UserinfoMenu,
      conversation: {},
      friend_uid: "",
      friend_info: {
        username: "",
        nickname: "",
        avatar_file: {
          url: ""
        }
      }
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    isFriend() {
      return this.friend_uid ? uni_modules_uniIm_sdk_index.uniIm.friend.find(this.friend_uid) : false;
    },
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    }
  }),
  onLoad(options) {
    return __async(this, null, function* () {
      this.load(options);
    });
  },
  methods: {
    $isCementing(is, name) {
      var _a;
      if (is.name)
        is = is.name;
      return name == ((_a = is == null ? void 0 : is.replace) == null ? void 0 : _a.call(is, /-(.?)/g, (match, c) => c.toUpperCase()).replace("-", ""));
    },
    load(options) {
      return __async(this, null, function* () {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/info.vue:125", "options", options);
        const { user_id, id } = options;
        this.conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(id ? id : { user_id });
        this.friend_uid = this.conversation.friend_uid;
        this.friend_info = yield uni_modules_uniIm_sdk_index.uniIm.users.get(this.friend_uid);
      });
    },
    changeConversationMute() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/info.vue:133", "changeConversationMute", this.conversation);
      this.conversation.changeMute();
    },
    deteleFriend() {
      return __async(this, null, function* () {
        common_vendor.index.showModal({
          title: "确认要删除好友吗",
          content: "此操作不可撤销",
          showCancel: true,
          cancelText: "取消",
          confirmText: "确认",
          complete: (e) => __async(this, null, function* () {
            if (e.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              try {
                yield db.collection("uni-im-friend").where({
                  friend_uid: this.friend_uid,
                  user_id: this.currentUid
                }).remove();
                if (!uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
                  common_vendor.index.navigateBack({ delta: 2 });
                }
              } catch (e2) {
                common_vendor.index.showModal({
                  content: JSON.stringify(e2.message),
                  showCancel: false
                });
              }
              common_vendor.index.hideLoading();
            }
          })
        });
      });
    },
    createGroup() {
      return __async(this, null, function* () {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/info.vue:169", "createGroup");
        const user_ids = [this.friend_uid];
        const uniImCo = common_vendor.tr.importObject("uni-im-co");
        let res = yield uniImCo.chooseUserIntoGroup({
          user_ids
        });
        common_vendor.index.$emit("uni-im-toChat", "group_" + res.data.group_id);
      });
    },
    setAliasRemark() {
      return __async(this, null, function* () {
        this.$refs.setAliasRemark.open(this.friend_uid);
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _component_setAliasRemark = common_vendor.resolveComponent("setAliasRemark");
  (_easycom_uni_im_info_card2 + _easycom_uni_list_item2 + _easycom_uni_list2 + _component_setAliasRemark)();
}
const _easycom_uni_im_info_card = () => "../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_list_item = () => "../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_im_info_card + _easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: common_vendor.p({
      avatarUrl: ((_a = $data.friend_info.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png",
      title: $data.friend_info.nickname,
      note: $data.friend_info.nickname != $data.friend_info.email ? $data.friend_info.email : ""
    }),
    b: common_vendor.o($options.changeConversationMute),
    c: common_vendor.p({
      title: "消息免打扰",
      ["switch-checked"]: $data.conversation.mute,
      ["show-switch"]: true
    }),
    d: _ctx.uniIDHasRole("staff")
  }, _ctx.uniIDHasRole("staff") ? {
    e: common_vendor.o($options.setAliasRemark),
    f: common_vendor.p({
      link: true,
      title: "设置别名和备注"
    })
  } : {}, {
    g: _ctx.uniIDHasRole("staff") && $data.friend_uid != $options.currentUid
  }, _ctx.uniIDHasRole("staff") && $data.friend_uid != $options.currentUid ? {
    h: common_vendor.o($options.createGroup),
    i: common_vendor.p({
      link: true,
      title: "选此用户创建群聊"
    })
  } : {}, {
    j: common_vendor.p({
      border: false
    }),
    k: $options.isFriend
  }, $options.isFriend ? {
    l: common_vendor.o((...args) => $options.deteleFriend && $options.deteleFriend(...args))
  } : {}, {
    m: common_vendor.sr("setAliasRemark", "338ef52e-5")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/chat/info.js.map
