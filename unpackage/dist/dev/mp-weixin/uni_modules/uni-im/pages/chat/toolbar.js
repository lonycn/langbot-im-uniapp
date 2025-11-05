"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniImToolBar",
  emits: ["shareMsg", "toolBarNext", "update:modelValue"],
  props: {
    checkedMsgList: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  methods: {
    shareMsg(merge) {
      this.$emit("shareMsg", merge);
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    toolBarNext() {
      common_vendor.index.showToast({
        title: "暂不支持",
        icon: "none",
        duration: 2e3
      });
      this.chooseMoreMsg = false;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.modelValue
  }, $props.modelValue ? {
    b: common_vendor.p({
      size: "20",
      type: "redo"
    }),
    c: common_vendor.o(($event) => $options.shareMsg(false)),
    d: common_vendor.p({
      size: "20",
      type: "paperplane"
    }),
    e: common_vendor.o(($event) => $options.shareMsg(true)),
    f: common_vendor.p({
      size: "20",
      type: "folder-add"
    }),
    g: common_vendor.o((...args) => $options.toolBarNext && $options.toolBarNext(...args)),
    h: common_vendor.p({
      size: "20",
      type: "download"
    }),
    i: common_vendor.o((...args) => $options.toolBarNext && $options.toolBarNext(...args)),
    j: common_vendor.p({
      size: "20",
      type: "trash"
    }),
    k: common_vendor.o((...args) => $options.toolBarNext && $options.toolBarNext(...args)),
    l: common_vendor.o($options.close),
    m: common_vendor.p({
      color: "#999",
      size: "35",
      type: "closeempty"
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/chat/toolbar.js.map
