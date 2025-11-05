"use strict";
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const uniImCodeView = () => "../../../components/uni-im-msg/types/code.js";
const _sfc_main = {
  components: {
    uniImCodeView
  },
  data() {
    return {
      msg: {
        type: "code",
        body: ""
      }
    };
  },
  onLoad({
    msgId,
    conversationId
  }) {
    this.msg = uni_modules_uniIm_sdk_index.uniIm.conversation.find(conversationId).msg.find(msgId);
  },
  methods: {}
};
if (!Array) {
  const _component_uni_im_code_view = common_vendor.resolveComponent("uni-im-code-view");
  _component_uni_im_code_view();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      msg: $data.msg,
      showFullBtn: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/common/view-code-page/view-code-page.js.map
