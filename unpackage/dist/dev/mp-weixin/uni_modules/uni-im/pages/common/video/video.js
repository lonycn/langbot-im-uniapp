"use strict";
const common_vendor = require("../../../../../common/vendor.js");
require("../../../sdk/index.js");
const _sfc_main = {
  data() {
    return {
      url: "",
      showCloseBtn: true,
      // 全屏模式和小窗模式，fullscreen为全屏模式，float为小窗模式
      mode: "fullscreen"
    };
  },
  onLoad({ url }) {
    this.url = url;
    setTimeout(() => {
      this.showCloseBtn = false;
    }, 1e3);
  },
  mounted() {
    common_vendor.index.$on("uni-im-playVideo", (url) => {
      this.mode = "float";
      this.url = url;
      this.showCloseBtn = true;
    });
  },
  beforeDestroy() {
  },
  methods: {
    onDownEscapeKey() {
      if (this.url.length) {
        this.close();
      }
      return true;
    },
    close() {
      if (this.mode == "fullscreen") {
        common_vendor.index.navigateBack();
      } else {
        this.url = "";
      }
    },
    showCloseBtnFn() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/common/video/video.vue:68", "showCloseBtnFn");
      this.showCloseBtn = true;
      if (this.mode == "fullscreen") {
        setTimeout(() => {
          this.showCloseBtn = false;
        }, 5e3);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.url
  }, $data.url ? common_vendor.e({
    b: $data.mode == "float"
  }, $data.mode == "float" ? {} : {}, {
    c: common_vendor.o((...args) => $options.showCloseBtnFn && $options.showCloseBtnFn(...args)),
    d: $data.url,
    e: $data.mode == "float",
    f: common_vendor.o((...args) => $options.close && $options.close(...args)),
    g: $data.mode == "float" ? 1 : "",
    h: common_vendor.o((...args) => $options.showCloseBtnFn && $options.showCloseBtnFn(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/common/video/video.js.map
