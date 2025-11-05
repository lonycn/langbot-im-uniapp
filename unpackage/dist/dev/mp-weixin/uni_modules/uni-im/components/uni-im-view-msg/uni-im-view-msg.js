"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniImViewMsg",
  data() {
    return {
      showMsgList: false,
      msgList: []
    };
  },
  methods: {
    open(msgList) {
      this.showMsgList = true;
      this.msgList = msgList;
    },
    close() {
      this.showMsgList = false;
      this.msgList = [];
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_msg2 = common_vendor.resolveComponent("uni-im-msg");
  (_easycom_uni_icons2 + _easycom_uni_im_msg2)();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_msg = () => "../uni-im-msg/uni-im-msg.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_im_msg)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showMsgList
  }, $data.showMsgList ? {
    b: common_vendor.p({
      type: "clear",
      size: "20px",
      color: "#ccc"
    }),
    c: common_vendor.o((...args) => $options.close && $options.close(...args)),
    d: common_vendor.f($data.msgList, (msg, index, i0) => {
      return {
        a: index,
        b: "67c1d2fe-1-" + i0,
        c: common_vendor.p({
          msg,
          preview: true
        })
      };
    }),
    e: common_vendor.o(() => {
    }),
    f: common_vendor.o(($event) => $options.close())
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-view-msg/uni-im-view-msg.js.map
