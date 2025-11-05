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
const common_vendor = require("../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../uni-im/sdk/index.js");
const _sfc_main = {
  name: "UniImMsgReader",
  props: {
    msg: {
      type: Object,
      default: () => {
      }
    },
    hiddenState: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false,
      showTransition: false,
      conversation: {},
      currentIndex: 0
    };
  },
  // 计算属性
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen", "systemInfo"])), {
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    isReady() {
      var _a, _b;
      return !((_b = (_a = this.conversation.group) == null ? void 0 : _a.member) == null ? void 0 : _b.hasMore);
    },
    memberUids() {
      var _a;
      const groupMember = (_a = this.conversation.group) == null ? void 0 : _a.member;
      if (groupMember) {
        return groupMember.dataList.filter((item) => item.users._id != this.msg.from_uid).map((item) => item.users._id);
      } else {
        return [];
      }
    },
    unreadUserList() {
      const unreadUserList = this.memberUids.filter((item) => !this.readerList.find((reader) => reader.user_id == item));
      return unreadUserList.map((item) => uni_modules_uniIm_sdk_index.uniIm.users[item]);
    },
    unreadUserCountTip() {
      let unreadUserCount = this.unreadUserList.length;
      unreadUserCount = unreadUserCount > 99 ? "99+" : unreadUserCount;
      return unreadUserCount > 0 ? `${unreadUserCount}人未读` : "全部已读";
    },
    isGroupMsg() {
      return !!this.msg.group_id;
    },
    readerList() {
      return this.msg.reader_list || [];
    },
    readerUserlist() {
      return this.readerList.map((item) => uni_modules_uniIm_sdk_index.uniIm.users[item.user_id]);
    }
  }),
  watch: {
    showPopup(state) {
      setTimeout(() => {
        this.showTransition = state;
      }, 0);
    }
  },
  mounted() {
    this.conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.msg.conversation_id);
  },
  methods: {
    clickHandler() {
      if (this.isGroupMsg) {
        if (uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
          this.showReaderList();
        } else {
          common_vendor.index.navigateTo({
            url: `/uni_modules/uni-im-msg-reader/pages/reader-list/reader-list?msgId=${this.msg._id}&conversationId=${this.msg.conversation_id}`
            // animationType: 'slide-in-bottom'
          });
        }
      }
    },
    showReaderList() {
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
    }
  }
};
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_cloud_image2 = common_vendor.resolveComponent("cloud-image");
  (_easycom_uni_segmented_control2 + _easycom_cloud_image2)();
}
const _easycom_uni_segmented_control = () => "../uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_cloud_image = () => "../uni-id-pages/components/cloud-image/cloud-image.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_cloud_image)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.msg.is_revoke && !$props.msg.revoke_ing
  }, !$props.msg.is_revoke && !$props.msg.revoke_ing ? common_vendor.e({
    b: $options.readerList && !$props.hiddenState
  }, $options.readerList && !$props.hiddenState ? {
    c: common_vendor.t($options.isGroupMsg ? $options.isReady ? $options.unreadUserCountTip : "" : $options.readerList.length ? "已读" : "未读"),
    d: $options.unreadUserList.length || $options.readerList.length ? 1 : "",
    e: $options.isGroupMsg ? 1 : "",
    f: common_vendor.o((...args) => $options.clickHandler && $options.clickHandler(...args))
  } : {}, {
    g: $data.showPopup && $options.isGroupMsg
  }, $data.showPopup && $options.isGroupMsg ? common_vendor.e({
    h: !_ctx.isWidescreen
  }, !_ctx.isWidescreen ? {
    i: common_vendor.o((e) => $data.currentIndex = e.currentIndex),
    j: common_vendor.p({
      current: $data.currentIndex,
      values: [`未读(${$options.unreadUserList.length})`, `已读(${$options.readerList.length})`],
      ["style-type"]: "text",
      ["active-color"]: "black"
    })
  } : {}, {
    k: _ctx.isWidescreen || $data.currentIndex == 0
  }, _ctx.isWidescreen || $data.currentIndex == 0 ? common_vendor.e({
    l: _ctx.isWidescreen
  }, _ctx.isWidescreen ? {
    m: common_vendor.t($options.unreadUserList.length)
  } : {}, {
    n: common_vendor.f($options.unreadUserList, (item, index, i0) => {
      return {
        a: "a5131838-1-" + i0,
        b: common_vendor.p({
          src: item.avatar_file && item.avatar_file.url || "/uni_modules/uni-im/static/avatarUrl.png",
          mode: "widthFix",
          width: "36px",
          height: "36px",
          ["border-radius"]: "15px"
        }),
        c: common_vendor.t(item.nickname),
        d: index
      };
    })
  }) : {}, {
    o: _ctx.isWidescreen || $data.currentIndex == 1
  }, _ctx.isWidescreen || $data.currentIndex == 1 ? common_vendor.e({
    p: _ctx.isWidescreen
  }, _ctx.isWidescreen ? {
    q: common_vendor.t($options.readerList.length)
  } : {}, {
    r: common_vendor.f($options.readerUserlist, (item, index, i0) => {
      return {
        a: "a5131838-2-" + i0,
        b: common_vendor.p({
          src: item.avatar_file && item.avatar_file.url || "/uni_modules/uni-im/static/avatarUrl.png",
          mode: "widthFix",
          width: "36px",
          height: "36px",
          ["border-radius"]: "15px"
        }),
        c: common_vendor.t(item.nickname),
        d: index
      };
    })
  }) : {}, {
    s: $data.showTransition ? 1 : "",
    t: common_vendor.o(() => {
    }),
    v: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args))
  }) : {}, {
    w: $options.currentUid == $props.msg.from_uid ? 1 : ""
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
function install() {
  uni_modules_uniIm_sdk_index.uniIm.extensions.installExt("msg-extra", (msg, currentUser) => {
    if (msg.from_uid !== uni_modules_uniIm_sdk_index.uniIm.currentUser._id)
      return;
    if (!uni_modules_uniIm_sdk_index.uniIm.currentUser.role.includes("staff"))
      return;
    if (msg.type == "system" || msg.is_revoke)
      return;
    let conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(msg.conversation_id);
    if (!(conversation == null ? void 0 : conversation.friend_uid))
      return;
    return {
      component: Component,
      props: {
        msg
      }
    };
  });
  uni_modules_uniIm_sdk_index.uniIm.extensions.installExt("msg-type-register", () => {
    return {
      type: "read_msg",
      isReadable(msg) {
        return false;
      },
      beforeLocalAdd(msgData, conversation) {
        let {
          body: {
            msgId
          },
          from_uid,
          create_time
        } = msgData;
        const msg = conversation.msg.find(msgId);
        if (msg) {
          let reader = {
            user_id: from_uid,
            create_time
          };
          msg.reader_list ? msg.reader_list.push(reader) : msg.reader_list = [reader];
        }
      }
    };
  });
  uni_modules_uniIm_sdk_index.uniIm.extensions.installExt("msg-appear", (msg) => {
    var _a, _b;
    const currentUid = uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    if (msg.type === "system" || msg.is_revoke)
      return;
    if (msg.from_uid == currentUid)
      return;
    if ((_a = msg.reader_list) == null ? void 0 : _a.some((u) => u.user_id == currentUid))
      return;
    let conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(msg.conversation_id);
    if (conversation.group_id && !((_b = msg.call_uid) == null ? void 0 : _b.includes(currentUid)))
      return;
    msg.reader_list = msg.reader_list || [];
    msg.reader_list.push({
      user_id: currentUid,
      create_time: Date.now()
    });
    const uniImCo = common_vendor.tr.importObject("uni-im-co", {
      customUI: true
    });
    uniImCo.sendMsg({
      type: "read_msg",
      body: {
        msgId: msg._id
      }
    }).catch((e) => {
      msg.reader_list = msg.reader_list.filter((u) => u.user_id !== currentUid);
    });
  });
}
const MsgReaderExtension = {
  install
};
exports.Component = Component;
exports.MsgReaderExtension = MsgReaderExtension;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/uni_modules/uni-im-msg-reader/extension.js.map
