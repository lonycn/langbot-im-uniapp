"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MsgImage",
  props: {
    image: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  setup(__props) {
    const props = __props;
    const source = common_vendor.computed(() => {
      const { url, base64, path } = props.image || {};
      if (base64) {
        return base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
      }
      if (url)
        return url;
      if (path)
        return path;
      return "";
    });
    function preview() {
      if (!source.value)
        return;
      common_vendor.index.previewImage({
        current: source.value,
        urls: [source.value]
      });
    }
    return (_ctx, _cache) => {
      return {
        a: source.value,
        b: common_vendor.o(preview),
        c: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2dc38275"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgImage.js.map
