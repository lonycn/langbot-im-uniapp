"use strict";
var __defProp = Object.defineProperty;
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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const msgRichText = () => "./rich-text.js";
const _sfc_main = {
  components: {
    msgRichText
  },
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
      htmlNodes: []
    };
  },
  computed: {
    self() {
      return this.msg.from_uid === uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    }
  },
  methods: {
    trText(str) {
      return str.replace(/\\n/g, "\\\\n");
    }
  },
  watch: {
    "msg.body": {
      handler() {
        let htmlString = this.msg.body.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        htmlString = uni_modules_uniIm_sdk_index.uniIm.utils.replaceUrlToLink(htmlString);
        if (this.msg.body != htmlString) {
          try {
            let htmlNodes = uni_modules_uniIm_sdk_index.uniIm.utils.parseHtml(htmlString);
            htmlNodes.map((item) => {
              if (item.attrs && item.attrs.class) {
                item.attrs.class += " msg-text";
              } else {
                item.attrs = {
                  class: "msg-text"
                };
              }
              return item;
            });
            this.htmlNodes = htmlNodes;
          } catch (e) {
            common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-msg/types/text.vue:77", "htmlString error：", e);
          }
        }
      },
      immediate: true
    }
  },
  mounted() {
  }
};
if (!Array) {
  const _component_msgRichText = common_vendor.resolveComponent("msgRichText");
  _component_msgRichText();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.htmlNodes.length
  }, $data.htmlNodes.length ? {
    b: common_vendor.p({
      msg: __spreadValues(__spreadValues({}, $props.msg), {
        "body": $data.htmlNodes
      })
    })
  } : {
    c: common_vendor.t($options.trText($props.msg.body))
  }, {
    d: $options.self ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/text.js.map
