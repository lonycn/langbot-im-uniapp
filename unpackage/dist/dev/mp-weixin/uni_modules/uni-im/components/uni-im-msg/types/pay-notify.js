"use strict";
const common_vendor = require("../../../../../common/vendor.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  methods: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.msg.body.order_id),
    b: common_vendor.t(new Date($props.msg.create_time).toLocaleString()),
    c: common_vendor.t($props.msg.body.price / 100),
    d: common_vendor.t($props.msg.body.pay_channel)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/pay-notify.js.map
