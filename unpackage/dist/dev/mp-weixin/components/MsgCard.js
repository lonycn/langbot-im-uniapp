"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  (MsgAudio + MsgVideo + MsgFile)();
}
const MsgAudio = () => "./MsgAudio.js";
const MsgVideo = () => "./MsgVideo.js";
const MsgFile = () => "./MsgFile.js";
const _sfc_main = {
  __name: "MsgCard",
  props: {
    card: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: "bot"
    }
  },
  emits: ["action", "media"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const cardType = common_vendor.computed(() => {
      var _a;
      return ((_a = props.card) == null ? void 0 : _a.card_type) || "general";
    });
    const hasFields = common_vendor.computed(() => {
      var _a;
      const fields = (_a = props.card) == null ? void 0 : _a.fields;
      return fields && Object.keys(fields).length > 0;
    });
    const cardMedia = common_vendor.computed(() => {
      var _a;
      return ((_a = props.card) == null ? void 0 : _a.media) || null;
    });
    function handleAction(action) {
      if (!action)
        return;
      if (action.confirm) {
        common_vendor.index.showModal({
          title: "确认操作",
          content: action.confirm,
          success: ({ confirm }) => {
            if (confirm)
              executeAction(action);
          }
        });
        return;
      }
      executeAction(action);
    }
    function executeAction(action) {
      if (action.type === "link" && action.url) {
        try {
          const target = `/uni_modules/uni-im/pages/common/webview/webview?url=${encodeURIComponent(action.url)}`;
          common_vendor.index.navigateTo({ url: target });
        } catch (error) {
          common_vendor.index.__f__("warn", "at components/MsgCard.vue:176", "[MsgCard] open link failed", error);
        }
      }
      emit("action", action);
    }
    function forwardMediaEvent(type, payload) {
      emit("media", { type, payload });
    }
    function renderStatusLabel(status) {
      switch (status) {
        case "done":
          return "已完成";
        case "processing":
          return "进行中";
        case "warning":
          return "需关注";
        default:
          return "待处理";
      }
    }
    function renderFieldPlaceholder(field) {
      if (!field)
        return "";
      if (field.placeholder)
        return field.placeholder;
      switch (field.type) {
        case "select":
          return "请选择";
        case "textarea":
          return "请输入内容";
        case "image":
          return `可上传 ${field.max_count || 3} 张图片`;
        default:
          return "填写内容";
      }
    }
    function renderActionLabel(action) {
      switch (action == null ? void 0 : action.type) {
        case "link":
          return "查看链接";
        case "postback":
          return "触发事件";
        case "submit_form":
          return "提交";
        case "open_widget":
          return "打开";
        case "interrupt":
          return "打断";
        default:
          return "操作";
      }
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
      return common_vendor.e({
        a: ((_a = __props.card) == null ? void 0 : _a.title) || ((_b = __props.card) == null ? void 0 : _b.subtitle)
      }, ((_c = __props.card) == null ? void 0 : _c.title) || ((_d = __props.card) == null ? void 0 : _d.subtitle) ? common_vendor.e({
        b: (_e = __props.card) == null ? void 0 : _e.icon
      }, ((_f = __props.card) == null ? void 0 : _f.icon) ? {
        c: common_vendor.t(__props.card.icon)
      } : {}, {
        d: (_g = __props.card) == null ? void 0 : _g.title
      }, ((_h = __props.card) == null ? void 0 : _h.title) ? {
        e: common_vendor.t(__props.card.title)
      } : {}, {
        f: (_i = __props.card) == null ? void 0 : _i.subtitle
      }, ((_j = __props.card) == null ? void 0 : _j.subtitle) ? {
        g: common_vendor.t(__props.card.subtitle)
      } : {}) : {}, {
        h: (_k = __props.card) == null ? void 0 : _k.description
      }, ((_l = __props.card) == null ? void 0 : _l.description) ? {
        i: common_vendor.t(__props.card.description)
      } : {}, {
        j: hasFields.value
      }, hasFields.value ? {
        k: common_vendor.f(__props.card.fields, (value, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(value),
            c: key
          };
        })
      } : {}, {
        l: Array.isArray((_m = __props.card) == null ? void 0 : _m.sections)
      }, Array.isArray((_n = __props.card) == null ? void 0 : _n.sections) ? {
        m: common_vendor.f(__props.card.sections, (section, idx, i0) => {
          return common_vendor.e({
            a: section == null ? void 0 : section.title
          }, (section == null ? void 0 : section.title) ? {
            b: common_vendor.t(section.title)
          } : {}, {
            c: (section == null ? void 0 : section.layout) === "key-value"
          }, (section == null ? void 0 : section.layout) === "key-value" ? {
            d: common_vendor.f(section.items || [], (item, itemIdx, i1) => {
              return {
                a: common_vendor.t(item.label || item.key),
                b: common_vendor.t(item.value),
                c: `kv-${idx}-${itemIdx}`
              };
            })
          } : (section == null ? void 0 : section.layout) === "list" ? {
            f: common_vendor.f(section.items || [], (item, itemIdx, i1) => {
              return common_vendor.e({
                a: common_vendor.t(item.title),
                b: item.status
              }, item.status ? {
                c: common_vendor.t(renderStatusLabel(item.status)),
                d: common_vendor.n(`status-${item.status}`)
              } : {}, {
                e: item.description
              }, item.description ? {
                f: common_vendor.t(item.description)
              } : {}, {
                g: `list-${idx}-${itemIdx}`
              });
            })
          } : {
            g: common_vendor.t((section == null ? void 0 : section.layout) || "unknown")
          }, {
            e: (section == null ? void 0 : section.layout) === "list",
            h: `section-${idx}`
          });
        })
      } : {}, {
        n: cardType.value === "timeline" && Array.isArray((_o = __props.card) == null ? void 0 : _o.timeline)
      }, cardType.value === "timeline" && Array.isArray((_p = __props.card) == null ? void 0 : _p.timeline) ? {
        o: common_vendor.f(__props.card.timeline, (node, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.n(`status-${node.status || "pending"}`),
            b: common_vendor.t(node.time),
            c: common_vendor.t(node.title),
            d: node.description
          }, node.description ? {
            e: common_vendor.t(node.description)
          } : {}, {
            f: `timeline-${idx}`
          });
        })
      } : {}, {
        p: cardType.value === "form" && ((_q = __props.card) == null ? void 0 : _q.form)
      }, cardType.value === "form" && ((_r = __props.card) == null ? void 0 : _r.form) ? {
        q: common_vendor.f(__props.card.form.fields || [], (field, k0, i0) => {
          return {
            a: common_vendor.t(field.label || field.field),
            b: common_vendor.t(renderFieldPlaceholder(field)),
            c: field.field || field.label
          };
        })
      } : {}, {
        r: cardType.value === "media" && cardMedia.value
      }, cardType.value === "media" && cardMedia.value ? common_vendor.e({
        s: cardMedia.value.type === "audio"
      }, cardMedia.value.type === "audio" ? {
        t: common_vendor.o(($event) => forwardMediaEvent("play", $event)),
        v: common_vendor.o(($event) => forwardMediaEvent("pause", $event)),
        w: common_vendor.o(($event) => forwardMediaEvent("ended", $event)),
        x: common_vendor.p({
          audio: cardMedia.value,
          from: __props.from
        })
      } : cardMedia.value.type === "video" ? {
        z: common_vendor.p({
          video: cardMedia.value,
          from: __props.from
        })
      } : cardMedia.value.type === "file" ? {
        B: common_vendor.o(($event) => forwardMediaEvent("open", $event)),
        C: common_vendor.p({
          file: cardMedia.value,
          from: __props.from
        })
      } : {
        D: common_vendor.t(cardMedia.value.type)
      }, {
        y: cardMedia.value.type === "video",
        A: cardMedia.value.type === "file"
      }) : {}, {
        E: Array.isArray((_s = __props.card) == null ? void 0 : _s.actions) && __props.card.actions.length
      }, Array.isArray((_t = __props.card) == null ? void 0 : _t.actions) && __props.card.actions.length ? {
        F: common_vendor.f(__props.card.actions, (action, idx, i0) => {
          return {
            a: common_vendor.t(action.text || renderActionLabel(action)),
            b: `action-${idx}`,
            c: common_vendor.o(($event) => handleAction(action), `action-${idx}`)
          };
        })
      } : {}, {
        G: common_vendor.n(__props.from === "me" ? "from-me" : "from-bot")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-79fc31d2"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MsgCard.js.map
