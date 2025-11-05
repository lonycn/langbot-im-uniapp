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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_utils_highlight_highlightUni_min = require("../../../sdk/utils/highlight/highlight-uni.min.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const MarkdownIt = uni_modules_uniIm_sdk_index.uniIm.utils.markdownIt;
const markdownIt = MarkdownIt({
  // 在源码中启用 HTML 标签
  html: true,
  // 如果结果以 <pre ... 开头，内部包装器则会跳过。
  highlight: function(str, language) {
    str = str.replace(/\t/g, "  ");
    let preCode = "";
    try {
      preCode = uni_modules_uniIm_sdk_utils_highlight_highlightUni_min.$e.highlightAuto(str).value;
    } catch (err) {
      preCode = markdownIt.utils.escapeHtml(str);
    }
    const lines = preCode.split(/\n/).slice(0, -1);
    let html = lines.map((item, index) => {
      if (item == "") {
        return "";
      }
      const style = `transform: translateX(${lines.length > 99 ? 10 : 0}px);height:20px;line-height: 20px;`;
      return `<li style="${style}"><span class="line-num" data-line="${index + 1}"></span>${item}</li>`;
    }).join("");
    html = "<ol>" + html + "</ol>";
    let htmlCode = `<div>`;
    htmlCode += `<pre class="hljs" style="padding-bottom:${uni_modules_uniIm_sdk_index.uniIm.isWidescreen ? 15 : 0}px;overflow: auto;display: block;"><code>${html}</code></pre>`;
    htmlCode += "</div>";
    return htmlCode;
  }
});
const _sfc_main = {
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    code() {
      return this.msg.body || "";
    }
  }),
  data() {
    return {
      nodes: [],
      language: "",
      htmlString: "",
      overflow: false,
      boxHeight: "20px"
    };
  },
  props: {
    msg: {
      type: Object,
      default() {
        return {};
      }
    },
    showFullBtn: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    code: {
      handler(code, oldValue) {
        this.htmlString = markdownIt.render("``` \n\n" + code + " \n\n ```");
        this.nodes = this.htmlString;
        const codeLine = this.code.split(/\n/).slice(0, -1).filter((item) => item).length + 1;
        let height = codeLine * 20;
        this.webViewHeight = height + "px";
        const maxHeight = 200;
        if (height > maxHeight) {
          this.overflow = true;
          this.boxHeight = maxHeight + "px";
        } else {
          this.boxHeight = height + "px";
        }
      },
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
    copyCode(e) {
      common_vendor.index.setClipboardData({
        data: this.code,
        showToast: false,
        success() {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "none"
          });
        }
      });
    },
    toCodePage() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-im/pages/common/view-code-page/view-code-page?msgId=" + this.msg._id + "&conversationId=" + this.msg.conversation_id
      });
    },
    trOnclick(e) {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/code.vue:160", "e", e);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.language),
    b: common_vendor.o((...args) => $options.copyCode && $options.copyCode(...args)),
    c: common_vendor.o(() => {
    }),
    d: $data.nodes.length
  }, $data.nodes.length ? {
    e: $data.nodes,
    f: common_vendor.o((...args) => $options.trOnclick && $options.trOnclick(...args)),
    g: _ctx.webViewHeight
  } : {}, {
    h: $data.overflow,
    i: $props.showFullBtn ? $data.boxHeight : "auto",
    j: !_ctx.isWidescreen && $props.showFullBtn && $data.overflow
  }, !_ctx.isWidescreen && $props.showFullBtn && $data.overflow ? {
    k: common_vendor.o((...args) => $options.toCodePage && $options.toCodePage(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/code.js.map
