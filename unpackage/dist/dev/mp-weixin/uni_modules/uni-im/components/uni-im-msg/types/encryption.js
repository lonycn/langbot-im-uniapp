"use strict";
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default: () => {
      }
    }
  },
  computed: {
    hasKey() {
      var _a;
      (_a = uni_modules_uniIm_sdk_index.uniIm.ext.encryptionKey) == null ? void 0 : _a[uni_modules_uniIm_sdk_index.uniIm.currentConversationId];
    }
  },
  methods: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.hasKey ? "，与配置的密钥不匹配" : "，当前未配置密钥")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/encryption.js.map
