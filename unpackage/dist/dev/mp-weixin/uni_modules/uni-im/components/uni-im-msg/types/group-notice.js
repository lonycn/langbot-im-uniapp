"use strict";
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const msgContent = () => "../msg-content.js";
const _sfc_main = {
  components: {
    msgContent
  },
  props: {
    msg: {
      type: Object,
      default() {
        return {
          body: ""
        };
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    friendlyTime() {
      return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(this.msg.create_time || this.msg.client_create_time);
    }
  },
  methods: {},
  watch: {},
  mounted() {
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_msg_content = common_vendor.resolveComponent("msg-content");
  (_easycom_uni_icons2 + _component_msg_content)();
}
const _easycom_uni_icons = () => "../../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.msg.is_revoke
  }, $props.msg.is_revoke ? {} : {
    b: common_vendor.p({
      size: "26",
      type: "sound-filled",
      color: "#0cc8fa"
    }),
    c: common_vendor.t($options.friendlyTime),
    d: common_vendor.p({
      msg: $props.msg.body.content,
      imgMaxWidth: "550rpx"
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/group-notice.js.map
