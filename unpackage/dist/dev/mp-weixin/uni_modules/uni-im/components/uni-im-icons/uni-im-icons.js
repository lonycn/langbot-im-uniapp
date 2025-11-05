"use strict";
const common_vendor = require("../../../../common/vendor.js");
const getVal = (val) => {
  const reg = /^[0-9]*$/g;
  return typeof val === "number" || reg.test(val) ? val + "px" : val;
};
const _sfc_main = {
  emits: ["click"],
  data() {
    return {};
  },
  props: {
    code: {
      type: String,
      default() {
        return "";
      }
    },
    color: {
      type: String,
      default: "#333333"
    },
    size: {
      type: [Number, String],
      default: 16
    }
  },
  computed: {
    unicode() {
      return unescape(`%u${this.code}`);
    },
    iconSize() {
      return getVal(this.size);
    }
  },
  methods: {
    _onClick(e) {
      this.$emit("click", e);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.unicode),
    b: $props.color,
    c: $options.iconSize,
    d: common_vendor.o((...args) => $options._onClick && $options._onClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-icons/uni-im-icons.js.map
