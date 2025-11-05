"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "FormPreviewWidget",
  props: {
    widget: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["action"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function emitAction(action) {
      if (!action)
        return;
      emit("action", action);
    }
    function renderPlaceholder(field) {
      if (!field)
        return "";
      if (field.placeholder)
        return field.placeholder;
      switch (field.type) {
        case "select":
          return "请选择";
        case "textarea":
          return "请输入文本";
        case "image":
          return `可上传 ${field.max_count || 3} 张图片`;
        default:
          return "填写内容";
      }
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g;
      return common_vendor.e({
        a: common_vendor.t(((_a = __props.widget) == null ? void 0 : _a.title) || "表单预览"),
        b: Array.isArray((_b = __props.widget) == null ? void 0 : _b.fields)
      }, Array.isArray((_c = __props.widget) == null ? void 0 : _c.fields) ? {
        c: common_vendor.f(__props.widget.fields, (field, k0, i0) => {
          return {
            a: common_vendor.t(field.label || field.field),
            b: common_vendor.t(renderPlaceholder(field)),
            c: field.field || field.label
          };
        })
      } : {}, {
        d: (_d = __props.widget) == null ? void 0 : _d.submit_text
      }, ((_e = __props.widget) == null ? void 0 : _e.submit_text) ? {
        e: common_vendor.t(__props.widget.submit_text),
        f: common_vendor.o(($event) => {
          var _a2, _b2;
          return emitAction({
            type: "submit_form",
            value: {
              form_ref: ((_a2 = __props.widget) == null ? void 0 : _a2.form_ref) || ((_b2 = __props.widget) == null ? void 0 : _b2.id)
            }
          });
        })
      } : {}, {
        g: (_f = __props.widget) == null ? void 0 : _f.cancel_text
      }, ((_g = __props.widget) == null ? void 0 : _g.cancel_text) ? {
        h: common_vendor.t(__props.widget.cancel_text),
        i: common_vendor.o(($event) => {
          var _a2, _b2;
          return emitAction({
            type: "cancel_form",
            value: {
              form_ref: ((_a2 = __props.widget) == null ? void 0 : _a2.form_ref) || ((_b2 = __props.widget) == null ? void 0 : _b2.id)
            }
          });
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f174388"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/widgets/FormPreviewWidget.js.map
