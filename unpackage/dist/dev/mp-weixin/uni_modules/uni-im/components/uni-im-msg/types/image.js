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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    previewImage() {
      return __async(this, null, function* () {
        common_vendor.index.showLoading();
        let url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
        common_vendor.index.previewImage({
          urls: [url],
          complete() {
            common_vendor.index.hideLoading();
          }
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  _easycom_uni_im_img2();
}
const _easycom_uni_im_img = () => "../../uni-im-img/uni-im-img.js";
if (!Math) {
  _easycom_uni_im_img();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.previewImage),
    b: common_vendor.p({
      ["max-width"]: "200px",
      src: $props.msg.body.url,
      width: $props.msg.body.width,
      height: $props.msg.body.height,
      mode: "widthFix"
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/image.js.map
