"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  props: {
    status: {
      type: String,
      default: "loading"
    },
    contentText: {
      type: Object,
      default() {
        return {
          "contentrefresh": "加载中...",
          "contentnomore": "- 没有相关数据 -"
        };
      }
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
    a: $props.status == "loading"
  }, $props.status == "loading" ? {
    b: common_vendor.p({
      color: "#bbb",
      size: 24,
      type: "spinner-cycle"
    })
  } : {}, {
    c: common_vendor.t($props.status == "loading" ? $props.contentText.contentrefresh : $props.contentText.contentnomore)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-load-state/uni-im-load-state.js.map
