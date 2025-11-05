"use strict";
const common_vendor = require("../../../../common/vendor.js");
const MsgByType_msgUserCard = () => "./types/userinfo-card.js";
const MsgByType_msgVideo = () => "./types/video.js";
const MsgByType_msgFile = () => "./types/file.js";
const MsgByType_msgHistory = () => "./types/history.js";
const MsgByType_msgRichText = () => "./types/rich-text.js";
const MsgByType_msgCode = () => "./types/code.js";
const MsgByType_msgText = () => "./types/text.js";
const MsgByType_msgSound = () => "./types/sound.js";
const MsgByType_msgImage = () => "./types/image.js";
const msgUserinfoCard = () => "./types/userinfo-card.js";
const msgVideo = () => "./types/video.js";
const msgFile = () => "./types/file.js";
const msgHistory = () => "./types/history.js";
const msgRichText = () => "./types/rich-text.js";
const msgCode = () => "./types/code.js";
const msgText = () => "./types/text.js";
const msgSound = () => "./types/sound.js";
const msgImage = () => "./types/image.js";
const msgOrder = () => "./types/order.js";
const msgPayNotify = () => "./types/pay-notify.js";
const msgEncryption = () => "./types/encryption.js";
const _sfc_main = {
  methods: {
    $isCementing(is, name) {
      var _a;
      if (is.name)
        is = is.name;
      return name == ((_a = is == null ? void 0 : is.replace) == null ? void 0 : _a.call(is, /-(.?)/g, (match, c) => c.toUpperCase()).replace("-", ""));
    }
  },
  emits: ["viewMsg"],
  components: {
    MsgByType_msgUserCard,
    MsgByType_msgVideo,
    MsgByType_msgFile,
    MsgByType_msgHistory,
    MsgByType_msgRichText,
    MsgByType_msgCode,
    MsgByType_msgText,
    MsgByType_msgSound,
    MsgByType_msgImage,
    msgUserinfoCard,
    msgVideo,
    msgFile,
    msgHistory,
    msgRichText,
    msgCode,
    msgText,
    msgSound,
    msgImage,
    msgOrder,
    msgPayNotify,
    msgEncryption
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
    imgMaxWidth: {
      type: [String, Number],
      default: "200px"
    }
  }
};
if (!Array) {
  const _component_MsgByType_msgUserCard = common_vendor.resolveComponent("MsgByType_msgUserCard");
  const _component_MsgByType_msgVideo = common_vendor.resolveComponent("MsgByType_msgVideo");
  const _component_MsgByType_msgFile = common_vendor.resolveComponent("MsgByType_msgFile");
  const _component_MsgByType_msgHistory = common_vendor.resolveComponent("MsgByType_msgHistory");
  const _component_MsgByType_msgRichText = common_vendor.resolveComponent("MsgByType_msgRichText");
  const _component_MsgByType_msgCode = common_vendor.resolveComponent("MsgByType_msgCode");
  const _component_MsgByType_msgText = common_vendor.resolveComponent("MsgByType_msgText");
  const _component_MsgByType_msgSound = common_vendor.resolveComponent("MsgByType_msgSound");
  const _component_MsgByType_msgImage = common_vendor.resolveComponent("MsgByType_msgImage");
  (_component_MsgByType_msgUserCard + _component_MsgByType_msgVideo + _component_MsgByType_msgFile + _component_MsgByType_msgHistory + _component_MsgByType_msgRichText + _component_MsgByType_msgCode + _component_MsgByType_msgText + _component_MsgByType_msgSound + _component_MsgByType_msgImage)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.$isCementing("msg-" + $props.msg.type, "msgUserCard")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgUserCard") ? {
    b: common_vendor.n("msg-" + $props.msg.type),
    c: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    d: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    e: $options.$isCementing("msg-" + $props.msg.type, "msgVideo")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgVideo") ? {
    f: common_vendor.n("msg-" + $props.msg.type),
    g: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    h: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    i: $options.$isCementing("msg-" + $props.msg.type, "msgFile")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgFile") ? {
    j: common_vendor.n("msg-" + $props.msg.type),
    k: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    l: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    m: $options.$isCementing("msg-" + $props.msg.type, "msgHistory")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgHistory") ? {
    n: common_vendor.n("msg-" + $props.msg.type),
    o: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    p: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    q: $options.$isCementing("msg-" + $props.msg.type, "msgRichText")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgRichText") ? {
    r: common_vendor.n("msg-" + $props.msg.type),
    s: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    t: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    v: $options.$isCementing("msg-" + $props.msg.type, "msgCode")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgCode") ? {
    w: common_vendor.n("msg-" + $props.msg.type),
    x: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    y: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    z: $options.$isCementing("msg-" + $props.msg.type, "msgText")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgText") ? {
    A: common_vendor.n("msg-" + $props.msg.type),
    B: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    C: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    D: $options.$isCementing("msg-" + $props.msg.type, "msgSound")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgSound") ? {
    E: common_vendor.n("msg-" + $props.msg.type),
    F: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    G: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {}, {
    H: $options.$isCementing("msg-" + $props.msg.type, "msgImage")
  }, $options.$isCementing("msg-" + $props.msg.type, "msgImage") ? {
    I: common_vendor.n("msg-" + $props.msg.type),
    J: common_vendor.o(($event) => _ctx.$emit("viewMsg", $event)),
    K: common_vendor.p({
      msg: $props.msg,
      imgMaxWidth: $props.imgMaxWidth
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/msg-content.js.map
