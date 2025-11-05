"use strict";
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const common_vendor = require("../../../../common/vendor.js");
const textMsg = () => "../uni-im-msg/types/text.js";
const _sfc_main = {
  components: {
    textMsg
  },
  data() {
    return {
      notification: {
        content: "",
        create_time: 0
      }
    };
  },
  props: {
    content: {
      type: String,
      default: ""
    },
    create_time: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    this.notification.content = this.content;
    this.notification.create_time = this.create_time;
  },
  computed: {
    friendlyTime() {
      return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(this.notification.create_time + uni_modules_uniIm_sdk_index.uniIm.heartbeat * 0);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_textMsg = common_vendor.resolveComponent("textMsg");
  (_easycom_uni_icons2 + _component_textMsg)();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      size: "26",
      type: "sound-filled",
      color: "#0cc8fa"
    }),
    b: common_vendor.p({
      msg: {
        body: $data.notification.content
      }
    }),
    c: common_vendor.t($options.friendlyTime)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-group-notification/uni-im-group-notification.js.map
