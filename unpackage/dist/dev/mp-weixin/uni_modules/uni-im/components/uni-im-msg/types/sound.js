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
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const common_assets = require("../../../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      soundPlayState: 0
    };
  },
  props: {
    msg: {
      type: Object,
      default() {
        return {
          from_uid: "",
          body: {
            time: 0
          }
        };
      }
    },
    soundBoxWidth: {
      type: String,
      default: "100px"
    }
  },
  computed: {
    self() {
      return this.msg.from_uid === uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    }
  },
  destroyed() {
    if (this.isInit) {
      const audioContext = uni_modules_uniIm_sdk_index.uniIm.audioContext;
      audioContext.offPlay(this.onPlay);
      audioContext.offPause(this.soundPlayEnd);
      audioContext.offStop(this.soundPlayEnd);
      audioContext.offEnded(this.soundPlayEnd);
      audioContext.offError(this.soundPlayEnd);
    }
  },
  methods: {
    init() {
      if (this.isInit) {
        return;
      }
      const audioContext = uni_modules_uniIm_sdk_index.uniIm.audioContext;
      this.onPlay = () => __async(this, null, function* () {
        const currentAudioUrl = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
        if (audioContext.src == currentAudioUrl) {
          this.soundPlayState = 1;
        } else {
          this.soundPlayState = 0;
        }
      });
      audioContext.onPlay(this.onPlay);
      this.soundPlayEnd = () => {
        this.soundPlayState = 0;
      };
      audioContext.onPause(this.soundPlayEnd);
      audioContext.onStop(this.soundPlayEnd);
      audioContext.onEnded(this.soundPlayEnd);
      audioContext.onError(this.soundPlayEnd);
      this.isInit = true;
    },
    playSound() {
      return __async(this, null, function* () {
        this.init();
        const audioContext = uni_modules_uniIm_sdk_index.uniIm.audioContext;
        audioContext.src = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
        setTimeout(() => {
          if (this.soundPlayState === 1) {
            audioContext.stop();
          } else {
            audioContext.stop();
            audioContext.play();
          }
        }, 0);
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
  return common_vendor.e({
    a: common_vendor.t($props.msg.body.time),
    b: $data.soundPlayState
  }, $data.soundPlayState ? {
    c: common_assets._imports_0$1
  } : {
    d: $data.soundPlayState ? 1 : "",
    e: common_vendor.p({
      code: "e6f5",
      size: "18px",
      color: "#000000"
    })
  }, {
    f: !$options.self ? 1 : "",
    g: !$options.self ? 1 : "",
    h: $props.soundBoxWidth,
    i: common_vendor.o((...args) => $options.playSound && $options.playSound(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/sound.js.map
