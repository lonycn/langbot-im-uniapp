"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "WebViewWidget",
  props: {
    widget: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    function openWebview() {
      var _a;
      const url = (_a = props.widget) == null ? void 0 : _a.url;
      if (!url) {
        return;
      }
      try {
        const target = `/uni_modules/uni-im/pages/common/webview/webview?url=${encodeURIComponent(url)}`;
        common_vendor.index.navigateTo({ url: target });
      } catch (error) {
        common_vendor.index.__f__("warn", "at components/widgets/WebViewWidget.vue:30", "[WebViewWidget] open webview failed", error);
        common_vendor.index.showToast({ title: "无法打开网页", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: common_vendor.t(((_a = __props.widget) == null ? void 0 : _a.title) || "网页预览"),
        b: (_b = __props.widget) == null ? void 0 : _b.description
      }, ((_c = __props.widget) == null ? void 0 : _c.description) ? {
        c: common_vendor.t(__props.widget.description)
      } : {}, {
        d: common_vendor.o(openWebview)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7804833f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/widgets/WebViewWidget.js.map
