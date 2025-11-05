"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const uni_modules_uniIm_common_config = require("../../common/config.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  emits: ["click"],
  props: {
    src: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: ""
    },
    maxWidth: {
      type: [String, Number, Boolean],
      default: false
    },
    maxHeight: {
      type: [String, Number],
      default: ""
    },
    width: {
      type: [String, Number],
      default: ""
    },
    height: {
      type: [String, Number],
      default: ""
    },
    borderRadius: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      url: "",
      viewWidth: "",
      viewHeight: ""
    };
  },
  mounted() {
    if (this.width && this.height) {
      const maxWidth = this.toPx(this.maxWidth);
      const maxHeight = this.toPx(this.maxHeight);
      let width = this.toPx(this.width);
      let height = this.toPx(this.height);
      if (width > maxWidth) {
        height = height * maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = width * maxHeight / height;
        height = maxHeight;
      }
      this.viewWidth = width + "px";
      this.viewHeight = height + "px";
    }
  },
  watch: {
    src: {
      handler(src) {
        return __async(this, null, function* () {
          if (src) {
            if (src.indexOf("blob:") === 0 || src.indexOf("./") === 0 || src.indexOf("/") === 0 || src.indexOf("@/") === 0) {
              this.url = src;
              return;
            }
            this.url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(src);
            const { provider } = uni_modules_uniIm_common_config.config.cloudFile;
            const maxWidth = this.maxWidth ? this.toPx(this.maxWidth) : "400";
            switch (provider) {
              case "aliyun":
                this.url += `?x-oss-process=image/resize,w_${maxWidth}/quality,q_80`;
                break;
              case "tencent":
                this.url += `?imageMogr2/thumbnail/${maxWidth}x${maxWidth}>`;
                break;
              case "qiniu":
                this.url += `?imageMogr2/thumbnail/${maxWidth}x${maxWidth}>`;
                break;
            }
          }
        });
      },
      immediate: true
    }
  },
  methods: {
    load(e) {
      if (!this.width || !this.height) {
        let width = e.detail.width;
        let maxWidth = this.toPx(this.maxWidth);
        if (maxWidth && width > maxWidth) {
          this.viewWidth = maxWidth + "px";
          this.viewHeight = maxWidth * e.detail.height / e.detail.width + "px";
        } else {
          this.viewWidth = e.detail.width + "px";
          this.viewHeight = e.detail.height + "px";
        }
      }
    },
    handleClick(event) {
      this.$emit("click", event);
    },
    // 如果是rpx单位，转换为px
    toPx(val) {
      if (typeof val === "string" && val.indexOf("rpx") > -1) {
        return parseInt(val) * uni_modules_uniIm_sdk_index.uniIm.systemInfo.windowWidth / 750;
      }
      return parseInt(val);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.load && $options.load(...args)),
    b: $data.url,
    c: $props.mode,
    d: $data.viewWidth,
    e: $data.viewHeight,
    f: $props.borderRadius,
    g: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-img/uni-im-img.js.map
