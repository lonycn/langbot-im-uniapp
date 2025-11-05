"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const _sfc_main = {
  emits: ["scroll", "scrolltolower"],
  data() {
    return {};
  },
  props: {
    scrollY: {
      default: true
    },
    scrollTop: {
      default: 0
    },
    scrollIntoView: {
      type: String,
      default: ""
    }
  },
  methods: {
    onScroll(e) {
      this.$emit("scroll", e);
    },
    onScrollToLower(e) {
      this.$emit("scrolltolower", e);
    }
  },
  mounted() {
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.scrollY,
    b: $props.scrollTop,
    c: $props.scrollIntoView,
    d: common_vendor.o((...args) => $options.onScroll && $options.onScroll(...args)),
    e: common_vendor.o((...args) => $options.onScrollToLower && $options.onScrollToLower(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg-list/components/uni-im-list/uni-im-list.js.map
