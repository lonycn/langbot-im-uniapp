"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "MusicPlayerWidget",
  props: {
    widget: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["action"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const playing = common_vendor.ref(false);
    const extraActions = common_vendor.computed(() => {
      var _a;
      return Array.isArray((_a = props.widget) == null ? void 0 : _a.actions) ? props.widget.actions : [];
    });
    function emitAction(action) {
      if (!action)
        return;
      if (action.type === "play") {
        playing.value = !playing.value;
      }
      emit("action", action);
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: (_a = __props.widget) == null ? void 0 : _a.cover
      }, ((_b = __props.widget) == null ? void 0 : _b.cover) ? {
        b: __props.widget.cover
      } : {}, {
        c: common_vendor.t(((_c = __props.widget) == null ? void 0 : _c.title) || "音频播放"),
        d: (_d = __props.widget) == null ? void 0 : _d.artist
      }, ((_e = __props.widget) == null ? void 0 : _e.artist) ? {
        e: common_vendor.t(__props.widget.artist)
      } : {}, {
        f: common_vendor.t(playing.value ? "暂停" : "播放"),
        g: common_vendor.o(($event) => {
          var _a2;
          return emitAction({
            type: "play",
            value: (_a2 = __props.widget) == null ? void 0 : _a2.source
          });
        }),
        h: common_vendor.f(extraActions.value, (action, idx, i0) => {
          return {
            a: common_vendor.t(action.text || "操作"),
            b: idx,
            c: common_vendor.o(($event) => emitAction(action), idx)
          };
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a48322c6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/widgets/MusicPlayerWidget.js.map
