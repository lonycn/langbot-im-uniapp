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
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
let onCloseFnList = [];
const _sfc_main = {
  computed: __spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])),
  data() {
    return {
      "isShow": false,
      "style": {
        "top": "",
        "left": "",
        "opacity": 1
      },
      "menuList": [
        {
          "title": "title",
          "action": "defaultAction"
        },
        {
          "title": "title2",
          "action": "defaultAction2"
        },
        {
          "title": "测试其中一个特别长",
          "action": "defaultAction2"
        }
      ]
    };
  },
  methods: {
    onClose(fn) {
      onCloseFnList.push(fn);
    },
    doAction(actionName) {
      actionName();
      this.closeMe();
    },
    show(position, menuList) {
      let {
        top = "",
        left = "",
        estimateWidth = 150,
        // 预估尺寸应该不小于实际渲染尺寸
        estimateHeight = 150
      } = position;
      let calcPosition = (top2, left2, width, height) => {
        let { windowWidth, windowHeight } = common_vendor.index.getWindowInfo();
        let style = {};
        if (top2) {
          if (top2 > windowHeight - height) {
            style.top = `${windowHeight - height}px`;
          } else {
            style.top = `${top2}px`;
          }
        }
        if (left2) {
          if (left2 > windowWidth - width) {
            style.left = `${windowWidth - width}px`;
          } else {
            style.left = `${left2}px`;
          }
        }
        return style;
      };
      this.style = calcPosition(top, left, estimateWidth, estimateHeight);
      this.isShow = true;
      this.menuList = menuList;
      this.style.opacity = 0;
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery().in(this);
        query.select(".contextmenu").boundingClientRect((option) => {
          const { width, height } = option;
          this.style = calcPosition(top, left, width, height);
          this.style.opacity = 1;
        }).exec();
      }, 0);
    },
    closeMe() {
      this.isShow = false;
      onCloseFnList.forEach((fn) => {
        if (typeof fn === "function") {
          fn();
        }
      });
      onCloseFnList = [];
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isShow
  }, $data.isShow ? {
    b: common_vendor.o((...args) => $options.closeMe && $options.closeMe(...args)),
    c: common_vendor.o((...args) => $options.closeMe && $options.closeMe(...args)),
    d: common_vendor.f($data.menuList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: index,
        c: common_vendor.o(($event) => $options.doAction(item.action), index)
      };
    }),
    e: $data.style.left,
    f: $data.style.top,
    g: $data.style.opacity,
    h: common_vendor.o(($event) => _ctx.isWidescreen ? $options.closeMe() : "")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-contextmenu/uni-im-contextmenu.js.map
