"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MsgText",
  props: {
    text: {
      type: String,
      default: ""
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.text),
        b: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d7d1bd91"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgText.js.map
