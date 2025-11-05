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
const _sfc_main = {
  data() {
    return {
      controlList: [],
      isShow: false,
      controlData: {
        top: "",
        bottom: "",
        left: "unset",
        right: "unset",
        width: "",
        msg: {},
        msgContentDomInfo: {},
        isInTop: false
      },
      opacity: 0
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    iconBoxLeft() {
      if (this.controlData.left != "unset") {
        const { left: mLeft, width: mWidth } = this.controlData.msgContentDomInfo;
        return mLeft + mWidth / 2 + "px";
      } else {
        return "";
      }
    },
    iconBoxRight() {
      if (this.controlData.right != "unset") {
        const { left: mLeft, right: mRight, width: mWidth } = this.controlData.msgContentDomInfo;
        const metrics = uni_modules_uniIm_sdk_index.uniIm.utils.getScreenMetrics();
        return metrics.pageWidth - mRight + mWidth / 2 + "px";
      } else {
        return "";
      }
    }
  }),
  mounted() {
  },
  methods: {
    chooseMore() {
      this.$emit("chooseMore", [this.controlData.msg]);
    },
    share(e) {
      this.$emit("share", [this.controlData.msg]);
    },
    initControlList(msg) {
      this.controlList = [
        {
          title: "回复",
          action: () => this.answer(),
          canDisplay: msg._id != void 0
          // 只有发送成功的消息才能回复
        },
        {
          title: "复制",
          action: () => this.copyContent(),
          canDisplay: uni_modules_uniIm_sdk_index.uniIm.systemInfo.uniPlatform === "web" && ["userinfo-card", "rich-text", "image"].includes(msg.type) || msg.type == "text"
        },
        {
          title: "撤回",
          action: () => this.revokeMsg(),
          canDisplay: this.canRevoke
        },
        // {
        //   title:'删除',
        //   action:()=>this.deleteMsg(),
        //   canDisplay:msg._id != undefined, 
        // },
        {
          title: "转发",
          action: () => this.share(),
          canDisplay: msg._id != void 0
        },
        {
          title: "多选",
          action: () => this.chooseMore(),
          canDisplay: msg._id != void 0
        },
        {
          title: "进入话题",
          action: () => this.$emit("intoTopic", msg._id),
          canDisplay: this.isWidescreen
        }
      ];
      let extensionsControlList = uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("msg-popup-controls", msg);
      this.controlList = this.controlList.concat(...extensionsControlList);
      this.controlList.map((item) => {
        const oldAction = item.action;
        item.action = () => {
          this.isShow = false;
          oldAction();
        };
      });
    },
    show(_0) {
      return __async(this, arguments, function* ({ isSelf, msg, msgContentDomInfo }) {
        this.initControlList(msg);
        this.opacity = 0;
        this.controlData.msg = msg;
        this.isShow = true;
        yield this.$nextTick();
        const controlData = {
          msgContentDomInfo,
          msg,
          isInTop: false
        };
        const query = common_vendor.index.createSelectorQuery().in(this);
        yield new Promise((resolve) => {
          query.selectAll(".content").boundingClientRect((data) => {
            controlData.width = data[0].width + "px";
            resolve();
          }).exec();
        });
        uni_modules_uniIm_sdk_index.uniIm.utils.getScreenMetrics();
        if (isSelf) {
          controlData.left = "unset";
          const metrics = uni_modules_uniIm_sdk_index.uniIm.utils.getScreenMetrics();
          controlData.right = metrics.pageWidth - msgContentDomInfo.right + msgContentDomInfo.width / 2 - parseInt(controlData.width) / 2 + "px";
        } else {
          controlData.left = msgContentDomInfo.left + msgContentDomInfo.width / 2 - parseInt(controlData.width) / 2 + "px";
          controlData.right = "unset";
        }
        controlData.isInTop = msgContentDomInfo.top > 60;
        if (controlData.isInTop) {
          let n = -65;
          controlData.top = msgContentDomInfo.top + n + "px";
        } else {
          let n = 10;
          controlData.top = msgContentDomInfo.bottom + n + "px";
        }
        if (parseInt(controlData.right) < 60) {
          controlData.right = "60px";
        }
        if (parseInt(controlData.left) < msgContentDomInfo.left) {
          controlData.left = msgContentDomInfo.left + "px";
        }
        this.controlData = controlData;
        this.$nextTick(() => {
          this.opacity = 1;
        });
      });
    },
    copyContent() {
      return __async(this, null, function* () {
        var _a;
        let data = "";
        const msgBody = this.controlData.msg.body;
        const action = {
          text() {
            data = msgBody;
          },
          "userinfo-card"() {
            data = location.origin + "/#/?user_id=" + msgBody.user_id;
          }
        };
        yield (_a = action[this.controlData.msg.type]) == null ? void 0 : _a.call(action);
        if (typeof data === "string") {
          common_vendor.index.setClipboardData({
            data,
            complete: (e) => {
              common_vendor.index.hideToast();
            }
          });
        }
      });
    },
    canRevoke() {
      let current_uid = uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
      let { group_id, from_uid, conversation_id, create_time } = this.controlData.msg || {};
      if (!this.controlData.msg._id) {
        return false;
      }
      if (this.uniIDHasRole("uni-im-admin")) {
        return true;
      }
      let isGroupAdmin = false;
      if (group_id) {
        let conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(conversation_id);
        isGroupAdmin = conversation.group.user_id == current_uid;
      }
      if (isGroupAdmin) {
        return true;
      }
      return from_uid == current_uid && Date.now() - create_time < 1e3 * 60 * 2;
    },
    revokeMsg() {
      return __async(this, null, function* () {
        if (this.canRevoke()) {
          const { conversation_id, _id: msg_id } = this.controlData.msg;
          uni_modules_uniIm_sdk_index.uniIm.conversation.find(conversation_id).revokeMsg(msg_id);
        } else {
          common_vendor.index.showToast({
            title: "已超过2分钟，不能撤回",
            icon: "none"
          });
        }
      });
    },
    answer() {
      return __async(this, null, function* () {
        this.$emit("answer", this.controlData.msg._id);
      });
    },
    deleteMsg() {
      return __async(this, null, function* () {
        return this.other();
      });
    },
    other() {
      common_vendor.index.showToast({
        title: "暂不支持",
        icon: "none"
      });
    },
    closeMe(evt) {
      if (uni_modules_uniIm_sdk_index.uniIm.isTouchable && evt.type === "click")
        return;
      this.isShow = false;
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  _easycom_uni_im_icons2();
}
const _easycom_uni_im_icons = () => "../uni-im-icons/uni-im-icons.js";
if (!Math) {
  _easycom_uni_im_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isShow
  }, $data.isShow ? {
    b: common_vendor.o((...args) => $options.closeMe && $options.closeMe(...args)),
    c: common_vendor.o((...args) => $options.closeMe && $options.closeMe(...args)),
    d: common_vendor.f($data.controlList, (item, index, i0) => {
      return common_vendor.e({
        a: typeof item.canDisplay == "function" ? item.canDisplay() : item.canDisplay
      }, (typeof item.canDisplay == "function" ? item.canDisplay() : item.canDisplay) ? common_vendor.e({
        b: item.icon
      }, item.icon ? {
        c: "58d7ba8f-0-" + i0,
        d: common_vendor.p({
          code: item.icon,
          size: "16",
          color: "#FFF"
        })
      } : {}, {
        e: common_vendor.t(item.title),
        f: index,
        g: common_vendor.o(item.action, index)
      }) : {});
    }),
    e: $data.controlData.top,
    f: $data.controlData.left,
    g: $data.controlData.right,
    h: $data.controlData.isInTop ? 1 : "",
    i: $options.iconBoxRight,
    j: $options.iconBoxLeft,
    k: $data.controlData.top,
    l: $data.opacity
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/popup-control.js.map
