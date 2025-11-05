"use strict";
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  props: {
    time: {
      type: Number,
      default: 0
    }
  },
  computed: {
    friendlyTime() {
      let time = this.time;
      time = time + uni_modules_uniIm_sdk_index.uniIm.heartbeat * 0;
      return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(time);
    }
  },
  data() {
    return {
      timeString: new Date(this.time).toLocaleString(),
      showDetail: false
    };
  },
  mounted() {
  },
  methods: {
    onclick() {
      this.showDetail = true;
      setTimeout(() => {
        this.showDetail = false;
      }, 2e3);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.friendlyTime),
    b: $data.showDetail
  }, $data.showDetail ? {
    c: common_vendor.t($data.timeString)
  } : {}, {
    d: common_vendor.o((...args) => $options.onclick && $options.onclick(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-friendly-time/uni-im-friendly-time.js.map
