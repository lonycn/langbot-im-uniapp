"use strict";
var __defProp = Object.defineProperty;
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
const MsgExtra_UniImMsgReader = () => "../../../uni-im-msg-reader/components/uni-im-msg-reader/uni-im-msg-reader.js";
const msgSystem = () => "./types/system.js";
const msgContent = () => "./msg-content.js";
const _sfc_main = {
  components: {
    MsgExtra_UniImMsgReader,
    msgSystem,
    msgContent
  },
  props: {
    msg: {
      type: Object,
      default() {
        return {
          body: ""
        };
      }
    },
    self: {
      type: Boolean,
      default() {
        return false;
      }
    },
    index: {
      type: Number
    },
    equalPrevTime: {
      type: Boolean,
      default() {
        return false;
      }
    },
    noTime: {
      // 不显示时间
      type: Boolean,
      default: false
    },
    noJump: {
      // 引用的消息不可点击跳转
      type: Boolean,
      default: false
    },
    preview: {
      // 是否预览模式
      type: Boolean,
      default: false
    }
  },
  emits: ["viewMsg", "showControl", "showMsgById", "longpressMsgAvatar", "putChatInputContent", "intoTopic", "retriesSendMsg"],
  data() {
    const extraComponents = this.preview ? {} : uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("msg-extra", this.msg).filter((result) => result && result.component).map((result) => {
      return {
        component: common_vendor.markRaw(result.component),
        props: result.props || {},
        handlers: result.handlers || {}
      };
    });
    return {
      videoUrl: "",
      soundPlayState: 0,
      aboutMsg: {},
      extraComponents
    };
  },
  computed: {
    extMsgBadge() {
      return uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("msg-badge", this).filter((result) => result && result.component).map((result) => {
        return {
          component: common_vendor.markRaw(result.component),
          props: result.props || {},
          handlers: result.handlers || {}
        };
      });
    },
    currentConversation() {
      if (this.preview)
        return false;
      return uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.msg.conversation_id);
    },
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    users() {
      const users = uni_modules_uniIm_sdk_index.uniIm.users[this.msg.from_uid];
      return (users == null ? void 0 : users.__loading) ? null : users;
    },
    msgStateIcon() {
      return {
        "0": "spinner-cycle",
        "-100": "refresh-filled",
        "-200": "info-filled"
      }[this.msg.state];
    },
    aboutMsgNote() {
      if (this.aboutMsg.from_uid) {
        return uni_modules_uniIm_sdk_index.uniIm.utils.getMsgNote(this.aboutMsg);
      } else {
        return "加载中...";
      }
    },
    isFromAdmin() {
      var _a, _b;
      if (this.preview)
        return false;
      const conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.msg.conversation_id);
      return (conversation == null ? void 0 : conversation.group_id) && ((_b = (_a = conversation.group.member.find(this.msg.from_uid)) == null ? void 0 : _a.role) == null ? void 0 : _b.includes("admin"));
    },
    nickname() {
      var _a;
      return ((_a = this.users) == null ? void 0 : _a.nickname) || this.msg.nickname || uni_modules_uniIm_sdk_index.uniIm.users.getNickname(this.msg.from_uid);
    },
    real_name() {
      var _a, _b;
      return (_b = (_a = uni_modules_uniIm_sdk_index.uniIm.users[this.msg.from_uid]) == null ? void 0 : _a.realname_auth) == null ? void 0 : _b.real_name;
    },
    avatarUrl() {
      var _a, _b, _c, _d, _e;
      return (this.self ? (_a = uni_modules_uniIm_sdk_index.uniIm.currentUser.avatar_file) == null ? void 0 : _a.url : ((_c = (_b = this.users) == null ? void 0 : _b.avatar_file) == null ? void 0 : _c.url) || ((_e = (_d = this.msg) == null ? void 0 : _d.avatar_file) == null ? void 0 : _e.url)) || "/uni_modules/uni-im/static/avatarUrl.png";
    },
    soundBoxWidth() {
      return common_vendor.index.upx2px(750 / 60 * this.msg.body.time) + 50 + "px";
    },
    canPrivateChat() {
      var _a, _b, _c;
      if (this.preview)
        return false;
      const conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.msg.conversation_id);
      const currentMember = (_b = (_a = conversation.group) == null ? void 0 : _a.member) == null ? void 0 : _b.find(this.currentUid);
      return this.uniIDHasRole("staff") || ((_c = currentMember == null ? void 0 : currentMember.role) == null ? void 0 : _c.includes("admin")) || this.isFromAdmin;
    }
  },
  mounted() {
    return __async(this, null, function* () {
      this.initAboutMsg();
    });
  },
  methods: {
    $isCementing(is, name) {
      var _a;
      if (is.name)
        is = is.name;
      return name == ((_a = is == null ? void 0 : is.replace) == null ? void 0 : _a.call(is, /-(.?)/g, (match, c) => c.toUpperCase()).replace("-", ""));
    },
    getNickname(uid) {
      return uni_modules_uniIm_sdk_index.uniIm.users.getNickname(uid);
    },
    showAboutMsg() {
      this.$emit("showMsgById", this.aboutMsg._id);
    },
    onAppear() {
      let index = this.currentConversation.remind_msg_ids.findIndex((i) => i == this.msg._id);
      if (index != -1) {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/uni-im-msg.vue:280", "已读，移除remind_msg_ids对应数据");
        this.currentConversation.readRemindMsg(this.msg._id);
      }
    },
    onDisappear() {
    },
    showControl(e) {
      return __async(this, null, function* () {
        let msgContentDomInfo;
        const query = common_vendor.index.createSelectorQuery().in(this);
        yield new Promise((callback) => {
          query.selectAll(".msg-content-box .msg-content").boundingClientRect((data) => {
            msgContentDomInfo = data[0];
            callback(msgContentDomInfo);
          }).exec();
        });
        this.$emit("showControl", {
          msgId: this.msg._id,
          msgContentDomInfo
        });
      });
    },
    retriesSendMsg() {
      this.$emit("retriesSendMsg", this.msg);
    },
    toChat() {
      if (this.canPrivateChat) {
        uni_modules_uniIm_sdk_index.uniIm.toChat({
          user_id: this.msg.from_uid,
          source: {
            group_id: this.msg.group_id
          }
        });
      }
    },
    longpressMsgAvatar() {
      if (this.msg.group_id) {
        this.$emit("longpressMsgAvatar", this.msg.from_uid);
      }
    },
    initAboutMsg() {
      return __async(this, null, function* () {
        if (this.preview)
          return;
        const {
          about_msg_id
        } = this.msg;
        if (about_msg_id) {
          let aboutMsg = this.currentConversation.msg.find(about_msg_id) || false;
          if (!aboutMsg) {
            const db = common_vendor.tr.database();
            let {
              conversation_id,
              "about_msg_id": _id
            } = this.msg;
            let res = yield db.collection("uni-im-msg").where({
              conversation_id,
              _id
            }).limit(1).get();
            aboutMsg = res.result.data[0];
            if (aboutMsg) {
              aboutMsg.isCloudMsg = true;
            } else {
              common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-msg/uni-im-msg.vue:358", "疑似脏数据，云端也没有查到");
              delete this.msg.about_msg_id;
              return;
            }
          }
          this.aboutMsg = aboutMsg;
        }
      });
    },
    putChatInputContent() {
      return __async(this, null, function* () {
        const msgBody = JSON.parse(JSON.stringify(this.msg.before_revoke_body));
        if (msgBody.url) {
          msgBody.url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(msgBody.url);
        } else if (Array.isArray(msgBody)) {
          for (let i = 0; i < msgBody.length; i++) {
            if (msgBody[i].name === "img") {
              msgBody[i].attrs.src = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(msgBody[i].attrs.src);
            }
          }
        }
        this.$emit("putChatInputContent", msgBody);
      });
    },
    showRealName() {
      if (!uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
        common_vendor.index.showModal({
          title: "企业名称",
          content: this.real_name,
          showCancel: true,
          confirmText: "复制",
          cancelText: "关闭",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.setClipboardData({
                data: this.real_name,
                success: () => {
                  common_vendor.index.showToast({
                    title: "复制成功",
                    icon: "none"
                  });
                }
              });
            }
          }
        });
      }
    }
  }
};
if (!Array) {
  const _component_msg_system = common_vendor.resolveComponent("msg-system");
  const _easycom_uni_im_friendly_time2 = common_vendor.resolveComponent("uni-im-friendly-time");
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_msg_content = common_vendor.resolveComponent("msg-content");
  const _component_MsgExtra_UniImMsgReader = common_vendor.resolveComponent("MsgExtra_UniImMsgReader");
  (_component_msg_system + _easycom_uni_im_friendly_time2 + _easycom_uni_im_img2 + _easycom_uni_icons2 + _component_msg_content + _component_MsgExtra_UniImMsgReader)();
}
const _easycom_uni_im_friendly_time = () => "../uni-im-friendly-time/uni-im-friendly-time.js";
const _easycom_uni_im_img = () => "../uni-im-img/uni-im-img.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_im_friendly_time + _easycom_uni_im_img + _easycom_uni_icons)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.msg.is_delete
  }, !$props.msg.is_delete ? common_vendor.e({
    b: $props.msg.type === "system"
  }, $props.msg.type === "system" ? {
    c: common_vendor.p({
      msg: $props.msg
    })
  } : common_vendor.e({
    d: !$props.noTime
  }, !$props.noTime ? {
    e: common_vendor.p({
      time: $props.msg.create_time || $props.msg.client_create_time
    }),
    f: $props.equalPrevTime ? 1 : ""
  } : {}, {
    g: $props.msg.is_revoke
  }, $props.msg.is_revoke ? common_vendor.e({
    h: $props.msg.before_revoke_body && ["text", "rich-text"].includes($props.msg.type)
  }, $props.msg.before_revoke_body && ["text", "rich-text"].includes($props.msg.type) ? {
    i: common_vendor.o((...args) => $options.putChatInputContent && $options.putChatInputContent(...args))
  } : {}) : $props.msg.revoke_ing ? {} : common_vendor.e({
    k: common_vendor.sr("avatar", "c6442fdc-2"),
    l: $options.canPrivateChat ? 1 : "",
    m: common_vendor.o($options.toChat),
    n: common_vendor.o($options.longpressMsgAvatar),
    o: common_vendor.p({
      width: "40px",
      height: "40px",
      ["border-radius"]: "5px",
      src: $options.avatarUrl,
      mode: "widthFix"
    }),
    p: !$props.self
  }, !$props.self ? common_vendor.e({
    q: common_vendor.t($options.nickname),
    r: !$props.preview ? 1 : "",
    s: common_vendor.o((...args) => $options.longpressMsgAvatar && $options.longpressMsgAvatar(...args)),
    t: $options.real_name
  }, $options.real_name ? {
    v: common_vendor.t($options.real_name),
    w: common_vendor.o((...args) => $options.showRealName && $options.showRealName(...args))
  } : {}, {
    x: $options.isFromAdmin
  }, $options.isFromAdmin ? {} : {}, {
    y: common_vendor.f($options.extMsgBadge, (item, index, i0) => {
      return {
        a: index
      };
    })
  }) : {}, {
    z: $props.msg.about_msg_id && !$props.preview
  }, $props.msg.about_msg_id && !$props.preview ? common_vendor.e({
    A: $data.aboutMsg.body
  }, $data.aboutMsg.body ? common_vendor.e({
    B: $data.aboutMsg.is_revoke
  }, $data.aboutMsg.is_revoke ? {} : {
    C: common_vendor.t($options.getNickname($data.aboutMsg.from_uid)),
    D: common_vendor.t($options.aboutMsgNote),
    E: !$props.noJump ? 1 : "",
    F: common_vendor.o((...args) => $options.showAboutMsg && $options.showAboutMsg(...args))
  }) : {}) : {}, {
    G: $props.self && $props.msg.state != 100 && $options.msgStateIcon
  }, $props.self && $props.msg.state != 100 && $options.msgStateIcon ? {
    H: common_vendor.o($options.retriesSendMsg),
    I: common_vendor.p({
      color: $props.msg.state === 0 ? "#999" : "#d22",
      type: $options.msgStateIcon
    })
  } : {}, {
    J: common_vendor.sr("msg-content", "c6442fdc-4"),
    K: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    L: common_vendor.p({
      msg: $props.msg
    }),
    M: common_vendor.o((...args) => $options.showControl && $options.showControl(...args)),
    N: common_vendor.f($data.extraComponents, (extra, k0, i0) => {
      return common_vendor.e({
        a: $options.$isCementing(extra.component, "UniImMsgReader")
      }, $options.$isCementing(extra.component, "UniImMsgReader") ? {
        b: common_vendor.sr("extras", "c6442fdc-5-" + i0, {
          "f": 1
        }),
        c: "c6442fdc-5-" + i0,
        d: common_vendor.p(__spreadValues({}, extra.props))
      } : {}, {
        e: extra.component.name
      });
    })
  }), {
    j: $props.msg.revoke_ing
  }), {
    O: $props.self ? 1 : ""
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/uni-im-msg.js.map
