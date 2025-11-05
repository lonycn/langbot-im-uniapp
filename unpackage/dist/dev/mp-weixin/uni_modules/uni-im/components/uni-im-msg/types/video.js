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
const uni_modules_uniIm_common_config = require("../../../common/config.js");
const _sfc_main = {
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
    return {
      videoPoster: "",
      //视频封面
      videoUrl: ""
      //视频地址
    };
  },
  watch: {
    "msg.body": {
      handler(msgBody) {
        return __async(this, null, function* () {
          this.videoUrl = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
          if (this.videoUrl.indexOf("blob:") === 0) {
            this.videoPoster = "/uni_modules/uni-im/static/msg/video-uploading.gif";
          } else {
            this.videoPoster = this.videoUrl + (this.videoUrl.indexOf("?") > -1 ? "&" : "?");
            const paramObj = {
              aliyun: "x-oss-process=video/snapshot,t_0,f_jpg,w_200,m_fast,ar_auto",
              tencent: "imageView2/0/w/200",
              qiniu: "vframe/jpg/offset/0/w/200"
            };
            this.videoPoster += paramObj[uni_modules_uniIm_common_config.config.cloudFile.provider];
          }
        });
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
    playVideo() {
      return __async(this, null, function* () {
        let url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
        if (uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
          common_vendor.index.$emit("uni-im-playVideo", url);
        } else {
          common_vendor.index.navigateTo({
            url: "/uni_modules/uni-im/pages/common/video/video?url=" + url,
            animationDuration: 300,
            animationType: "fade-in"
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  _easycom_uni_im_icons2();
}
const _easycom_uni_im_icons = () => "../../uni-im-icons/uni-im-icons.js";
if (!Math) {
  _easycom_uni_im_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.videoPoster,
    b: common_vendor.p({
      code: "e650",
      size: "35",
      color: "#FFF"
    }),
    c: common_vendor.o((...args) => $options.playVideo && $options.playVideo(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/video.js.map
