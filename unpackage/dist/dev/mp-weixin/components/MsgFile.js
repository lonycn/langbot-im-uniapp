"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "MsgFile",
  props: {
    file: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  emits: ["open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const fileName = common_vendor.computed(() => {
      var _a;
      return ((_a = props.file) == null ? void 0 : _a.name) || "附件";
    });
    const fileUrl = common_vendor.computed(() => {
      var _a;
      return ((_a = props.file) == null ? void 0 : _a.url) || "";
    });
    const sizeLabel = common_vendor.computed(() => {
      var _a;
      const size = (_a = props.file) == null ? void 0 : _a.size;
      if (!size)
        return "未知大小";
      const units = ["B", "KB", "MB", "GB"];
      let value = size;
      let idx = 0;
      while (value > 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
      }
      return `${value.toFixed(1)} ${units[idx]}`;
    });
    const mimeLabel = common_vendor.computed(() => {
      var _a;
      return ((_a = props.file) == null ? void 0 : _a.mime) || "未知类型";
    });
    function openFile() {
      if (!fileUrl.value)
        return;
      emit("open", props.file);
      common_vendor.index.openDocument({
        filePath: fileUrl.value,
        showMenu: true,
        fail(err) {
          common_vendor.index.__f__("warn", "at components/MsgFile.vue:61", "[MsgFile] open document failed", err);
          common_vendor.index.showToast({ title: "无法打开附件", icon: "none" });
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(fileName.value),
        b: fileName.value,
        c: common_vendor.t(sizeLabel.value),
        d: common_vendor.t(mimeLabel.value),
        e: common_vendor.o(openFile),
        f: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b210904"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgFile.js.map
