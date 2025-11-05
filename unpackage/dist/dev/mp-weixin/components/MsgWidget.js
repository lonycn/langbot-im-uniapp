"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  (MusicPlayerWidget + FormPreviewWidget + WebViewWidget)();
}
const MusicPlayerWidget = () => "./widgets/MusicPlayerWidget.js";
const FormPreviewWidget = () => "./widgets/FormPreviewWidget.js";
const WebViewWidget = () => "./widgets/WebViewWidget.js";
const _sfc_main = {
  __name: "MsgWidget",
  props: {
    widget: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  emits: ["action"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const type = common_vendor.computed(() => {
      var _a;
      return (((_a = props.widget) == null ? void 0 : _a.type) || "").toLowerCase();
    });
    common_vendor.watch(
      () => props.widget,
      (val) => {
        common_vendor.index.__f__("log", "at components/MsgWidget.vue:50", "[MsgWidget] render widget =>", val == null ? void 0 : val.type, val);
      },
      { immediate: true, deep: true }
    );
    function forwardAction(action) {
      emit("action", action);
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: type.value === "music_player"
      }, type.value === "music_player" ? {
        b: common_vendor.o(forwardAction),
        c: common_vendor.p({
          widget: __props.widget
        })
      } : type.value === "form_preview" ? {
        e: common_vendor.o(forwardAction),
        f: common_vendor.p({
          widget: __props.widget
        })
      } : type.value === "webview" ? {
        h: common_vendor.p({
          widget: __props.widget
        })
      } : {
        i: common_vendor.t(((_a = __props.widget) == null ? void 0 : _a.title) || "未知组件"),
        j: common_vendor.t(((_b = __props.widget) == null ? void 0 : _b.type) || "unknown")
      }, {
        d: type.value === "form_preview",
        g: type.value === "webview",
        k: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89c0f3c9"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgWidget.js.map
