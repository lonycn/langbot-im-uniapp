"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MsgVideo",
  props: {
    video: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  emits: ["error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const source = common_vendor.computed(() => {
      var _a;
      return ((_a = props.video) == null ? void 0 : _a.url) || "";
    });
    const durationLabel = common_vendor.computed(() => {
      var _a;
      const duration = (_a = props.video) == null ? void 0 : _a.duration;
      if (!duration && duration !== 0)
        return "";
      const seconds = Math.round(duration);
      const mm = Math.floor(seconds / 60);
      const ss = seconds % 60;
      return `${mm}:${ss.toString().padStart(2, "0")}`;
    });
    const sizeLabel = common_vendor.computed(() => {
      var _a;
      const size = (_a = props.video) == null ? void 0 : _a.size;
      if (!size)
        return "";
      const units = ["B", "KB", "MB", "GB"];
      let value = size;
      let idx = 0;
      while (value > 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
      }
      return `${value.toFixed(1)} ${units[idx]}`;
    });
    function handleError(event) {
      common_vendor.index.__f__("warn", "at components/MsgVideo.vue:63", "[MsgVideo] play failed", (event == null ? void 0 : event.detail) || event);
      emit("error", event);
    }
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: (_a = __props.video) == null ? void 0 : _a.title
      }, ((_b = __props.video) == null ? void 0 : _b.title) ? {
        b: common_vendor.t(__props.video.title)
      } : {}, {
        c: source.value,
        d: ((_c = __props.video) == null ? void 0 : _c.cover_url) || "",
        e: common_vendor.o(handleError),
        f: durationLabel.value
      }, durationLabel.value ? {
        g: common_vendor.t(durationLabel.value)
      } : {}, {
        h: sizeLabel.value
      }, sizeLabel.value ? {
        i: common_vendor.t(sizeLabel.value)
      } : {}, {
        j: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-40d292f3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgVideo.js.map
