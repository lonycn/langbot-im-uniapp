"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MsgAudio",
  props: {
    audio: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  emits: ["play", "pause", "ended"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    common_vendor.ref(null);
    const innerAudio = common_vendor.ref(null);
    const playing = common_vendor.ref(false);
    const source = common_vendor.computed(() => {
      var _a;
      return ((_a = props.audio) == null ? void 0 : _a.url) || "";
    });
    const durationLabel = common_vendor.computed(() => {
      var _a;
      const duration = (_a = props.audio) == null ? void 0 : _a.duration;
      if (!duration && duration !== 0)
        return "";
      const seconds = Math.round(duration);
      const mm = Math.floor(seconds / 60);
      const ss = seconds % 60;
      return `${mm}:${ss.toString().padStart(2, "0")}`;
    });
    const audioTitle = common_vendor.computed(() => {
      var _a;
      return ((_a = props.audio) == null ? void 0 : _a.title) || "语音消息";
    });
    function stopPlayback() {
      playing.value = false;
      if (innerAudio.value) {
        innerAudio.value.stop();
      }
    }
    function togglePlay() {
      if (!source.value)
        return;
      if (playing.value) {
        stopPlayback();
        emit("pause", props.audio);
        return;
      }
      playing.value = true;
      emit("play", props.audio);
      if (!innerAudio.value) {
        const ctx = common_vendor.index.createInnerAudioContext();
        ctx.autoplay = false;
        ctx.obeyMuteSwitch = false;
        ctx.src = source.value;
        ctx.onEnded(() => {
          playing.value = false;
          emit("ended", props.audio);
        });
        ctx.onError((err) => {
          common_vendor.index.__f__("warn", "at components/MsgAudio.vue:113", "[MsgAudio] play failed", err);
          playing.value = false;
        });
        innerAudio.value = ctx;
      } else {
        innerAudio.value.stop();
        innerAudio.value.src = source.value;
      }
      innerAudio.value.play();
    }
    common_vendor.onMounted(() => {
      return () => {
      };
    });
    common_vendor.onBeforeUnmount(() => {
      if (innerAudio.value) {
        innerAudio.value.stop();
        innerAudio.value.destroy();
        innerAudio.value = null;
      }
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.t(audioTitle.value),
        b: durationLabel.value
      }, durationLabel.value ? {
        c: common_vendor.t(durationLabel.value)
      } : {}, {
        d: common_vendor.t(playing.value ? "暂停" : "播放  "),
        e: common_vendor.o(togglePlay),
        f: (_a = __props.audio) == null ? void 0 : _a.transcript
      }, ((_b = __props.audio) == null ? void 0 : _b.transcript) ? {
        g: common_vendor.t(__props.audio.transcript)
      } : {}, {
        h: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f95fd42d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgAudio.js.map
