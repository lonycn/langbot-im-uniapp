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
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const _sfc_main = {
  emits: ["input", "confirm", "change", "click"],
  computed: __spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["systemInfo"])),
  data() {
    return {
      callRmdParam: [],
      "textareaValue": this.modelValue,
      lastCursor: this.modelValue.length,
      isFocus: false
    };
  },
  props: {
    hideKeyboard: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: [String, Object],
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    maxlength: {
      type: Number,
      default: 140
    },
    // 回车直接发送
    enterSend: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    textareaValue(val) {
      this.$emit("change", {
        value: val
      });
    }
  },
  mounted() {
    this.callRmd = (funcName, ...params) => __async(this, null, function* () {
      switch (funcName) {
        case "$setContent":
          this.textareaValue = params[0];
          break;
        case "$addHtmlToCursor":
          setTimeout(() => {
            this.textareaValue = this.textareaValue.slice(0, this.lastCursor) + params[0] + this.textareaValue.slice(this.lastCursor);
          }, 300);
          break;
        default:
          common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-editor/uni-im-editor.vue:86", "小程序暂不支持与rmd通讯", funcName, params);
          break;
      }
      return;
    });
  },
  methods: {
    oninput(e) {
      let oldValue = this.oninput.oldValue || "";
      const value = e.detail.value;
      const data = value.replace(oldValue, "");
      this.oninput.oldValue = value;
      e = {
        data,
        value
      };
      this.$emit("input", e);
    },
    focus() {
      this.isFocus = false;
      setTimeout(() => {
        this.isFocus = true;
      }, 0);
    },
    clickhandler(e) {
      this.$emit("click", e);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o([($event) => $data.textareaValue = $event.detail.value, (...args) => $options.oninput && $options.oninput(...args)]),
    b: $props.maxlength,
    c: common_vendor.o(($event) => {
      $data.lastCursor = $event.detail.cursor;
      $data.isFocus = false;
    }),
    d: $data.lastCursor,
    e: common_vendor.o(($event) => $data.isFocus = true),
    f: $data.isFocus,
    g: $data.textareaValue,
    h: common_vendor.o((...args) => $options.clickhandler && $options.clickhandler(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-editor/uni-im-editor.js.map
