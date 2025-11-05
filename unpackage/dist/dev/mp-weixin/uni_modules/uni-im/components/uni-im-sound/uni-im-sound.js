"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const recorderManager = common_vendor.index.getRecorderManager();
let soundInterval, startTime;
const _sfc_main = {
  emits: ["sendSoundMsg"],
  data() {
    return {
      recordState: 0,
      soundProgress: 0,
      cancel: false,
      time: 0,
      phoneBH: 0
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["systemInfo"])), {
    markBottom() {
      let markBottom = 67;
      markBottom += this.systemInfo.safeAreaInsets.bottom / 2;
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:43", "markBottom", markBottom);
      return markBottom + "px";
    }
  }),
  created() {
    recorderManager.onStop((res) => {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:50", "recorderManager.onStop", { res });
      if (!this.cancel) {
        if (this.time < 2) {
          return common_vendor.index.showToast({
            title: "语音时间过短",
            icon: "none"
          });
        }
        common_vendor.index.showLoading({
          title: "上传中",
          mask: false
        });
        common_vendor.tr.uploadFile({
          filePath: res.tempFilePath,
          cloudPath: "uni-im/" + uni_modules_uniIm_sdk_index.uniIm.currentUser._id + "/sound/" + Date.now() + ".mp3",
          // fileType:"audio",
          success: (e) => {
            try {
              this.$emit("sendSoundMsg", { "url": e.fileID, time: this.time });
            } catch (e2) {
              common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:71", e2);
            }
            common_vendor.index.hideLoading();
          },
          fail: (e) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:76", e);
            common_vendor.index.showModal({
              content: JSON.stringify(e),
              showCancel: false,
              confirmText: "知道了"
            });
          },
          complete: (e) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:84", "complete", e);
            common_vendor.index.hideLoading();
          }
        });
      } else {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:89", "用户取消了录音功能", "this.time:" + this.time);
      }
    });
    recorderManager.onStart((e) => {
    });
    recorderManager.onPause((e) => {
    });
    recorderManager.onError((e) => {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:100", e);
    });
  },
  methods: {
    touchmove(e) {
      let touchY = e.touches[0].clientY + this.systemInfo.statusBarHeight + this.systemInfo.safeArea.top;
      this.cancel = this.systemInfo.safeArea.bottom - touchY > 66;
    },
    recordStart(e) {
      uni_modules_uniIm_sdk_index.uniIm.audioContext.stop();
      this.time = 0;
      recorderManager.start({
        sampleRate: 16e3,
        numberOfChannels: 2,
        format: "mp3"
      });
      startTime = Date.now();
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:139", "recordStart");
      this.recordState = 1;
      soundInterval = setInterval(() => {
        this.soundProgress = parseInt(this.soundProgress) + common_vendor.index.upx2px(450 / 60) + "px";
        this.time = parseInt((Date.now() - startTime) / 1e3);
      }, 1e3);
    },
    recordEnd() {
      recorderManager.stop();
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-sound/uni-im-sound.vue:154", "recordEnd");
      clearInterval(soundInterval);
      setTimeout(() => {
        this.recordState = 0;
        this.soundProgress = 0;
        this.cancel = false;
      }, 300);
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  _easycom_uni_im_icons2();
}
const _easycom_uni_im_icons = () => "../uni-im-icons/uni-im-icons.js";
if (!Math) {
  _easycom_uni_im_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.soundProgress
  }, $data.soundProgress ? {
    b: $data.soundProgress
  } : {}, {
    c: common_vendor.t($data.recordState ? "录音中（" + $data.time + "s）" : "按住 说话"),
    d: $data.recordState
  }, $data.recordState ? {
    e: common_vendor.t($data.cancel ? "松手取消" : "松手发送，上划取消"),
    f: $data.cancel ? "#f70000" : "#FFFFFF",
    g: common_vendor.p({
      code: "e61a",
      size: "10px",
      color: "#FFFFFF"
    }),
    h: $data.cancel ? "#f70000" : "#EEEEEE"
  } : {}, {
    i: common_vendor.o((...args) => $options.touchmove && $options.touchmove(...args)),
    j: common_vendor.o((...args) => $options.recordStart && $options.recordStart(...args)),
    k: common_vendor.o((...args) => $options.recordEnd && $options.recordEnd(...args)),
    l: common_vendor.o((...args) => $options.recordEnd && $options.recordEnd(...args)),
    m: $data.recordState ? 1 : "",
    n: $data.recordState
  }, $data.recordState ? {
    o: $options.markBottom
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-sound/uni-im-sound.js.map
