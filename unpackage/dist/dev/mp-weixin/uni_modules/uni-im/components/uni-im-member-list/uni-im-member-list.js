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
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
let confirmFunc = () => {
};
const _sfc_main = {
  props: {
    conversationId: {
      default: ""
    },
    memberListData: {
      type: [Array, null],
      default: null
    }
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    memberList() {
      var _a, _b, _c;
      let memberList = [];
      if (this.memberListData) {
        memberList = this.memberListData;
      } else {
        memberList = ((_b = (_a = uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.conversationId)) == null ? void 0 : _a.group) == null ? void 0 : _b.member.dataList) || [];
      }
      if (this.mapFn) {
        memberList = memberList.map(this.mapFn);
      }
      if (this.filterFn) {
        memberList = memberList.filter(this.filterFn);
      }
      if (this.keyword) {
        memberList = memberList.filter((item) => item.users.nickname.toLowerCase().includes(this.keyword.toLowerCase()));
      }
      memberList.sort((a, b) => {
        return a.users.nickname.localeCompare(b.users.nickname);
      });
      this.activeUid = (_c = memberList[0]) == null ? void 0 : _c.users._id;
      return memberList;
    }
  }),
  data() {
    return {
      isShow: false,
      scrollTop: 0,
      activeUid: "",
      filterFn: null,
      mapFn: null,
      title: "",
      keyword: "",
      forceShowSearch: false
    };
  },
  methods: {
    confirm(uid) {
      confirmFunc(uid);
      this.hide();
    },
    onChatInput(e) {
      const enterText = e.data;
      if (!this.isShow)
        return;
      if (enterText == null) {
        this.keyword = this.keyword.slice(0, -1);
      } else if (enterText == "@") {
        this.keyword = "";
      } else {
        setTimeout(() => {
          {
            this.keyword += enterText;
          }
        }, 0);
      }
    },
    onChatInputKeydown(e) {
      if (!this.isShow)
        return;
      if (e.key == "Enter") {
        if (this.memberList.length) {
          this.confirm(this.activeUid);
        }
      } else if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        let index = this.memberList.findIndex((i) => i.users._id == this.activeUid);
        if (e.key == "ArrowUp") {
          index--;
        } else {
          index++;
        }
        if (index < 0 || index > this.memberList.length - 1) {
          index = 0;
        }
        this.activeUid = this.memberList[index].users._id;
        this.scrollTop = (index - 3) * 45;
        e.preventDefault();
      } else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        this.hide();
      } else if (e.key == "Backspace") {
        setTimeout(() => {
          var _a, _b;
          let newValue = e.target.innerText;
          let newAtN = newValue.replace(/[^@]/g, "").length;
          let oldAtN = ((_b = (_a = this.oldChatInputValue) == null ? void 0 : _a.replace(/[^@]/g, "")) == null ? void 0 : _b.length) || 0;
          if (newAtN === 0 || newAtN < oldAtN) {
            this.hide();
          }
          this.oldChatInputValue = newValue;
        }, 0);
      }
    },
    show(_a) {
      var _b = _a, { confirm } = _b, param = __objRest(_b, ["confirm"]);
      if (this.isShow) {
        return common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-member-list/uni-im-member-list.vue:151", "已经显示了");
      }
      this.isShow = true;
      if (confirm) {
        confirmFunc = confirm;
      }
      this.keyword = "";
      this.filterFn = param.filter;
      this.mapFn = param.map;
      this.title = param.title || "选择提醒的人";
      this.forceShowSearch = param.forceShowSearch;
    },
    hide() {
      this.keyword = "";
      this.isShow = false;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  (_easycom_uni_icons2 + _easycom_uni_search_bar2)();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_search_bar = () => "../../../uni-search-bar/components/uni-search-bar/uni-search-bar.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_search_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isShow && (_ctx.isWidescreen && !$data.forceShowSearch ? $options.memberList.length != 0 : 1)
  }, $data.isShow && (_ctx.isWidescreen && !$data.forceShowSearch ? $options.memberList.length != 0 : 1) ? common_vendor.e({
    b: common_vendor.o(($event) => $options.hide()),
    c: common_vendor.o(($event) => $options.hide()),
    d: common_vendor.p({
      type: "back",
      color: "#000",
      size: "12px"
    }),
    e: common_vendor.t($data.title),
    f: !_ctx.isWidescreen || $data.forceShowSearch
  }, !_ctx.isWidescreen || $data.forceShowSearch ? {
    g: common_vendor.o(($event) => $data.keyword = $event),
    h: common_vendor.p({
      focus: true,
      placeholder: "搜索",
      cancelButton: "none",
      modelValue: $data.keyword
    })
  } : {}, {
    i: common_vendor.f($options.memberList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.users.nickname),
        b: common_vendor.t(item.users.real_name),
        c: item._id,
        d: $data.activeUid == item.users._id ? 1 : "",
        e: common_vendor.o(($event) => $data.activeUid = item.users._id, item._id),
        f: common_vendor.o(($event) => $options.confirm(item.users._id), item._id),
        g: "a" + item.users._id
      };
    }),
    j: $options.memberList.length === 0
  }, $options.memberList.length === 0 ? {
    k: common_vendor.t($data.keyword)
  } : {}, {
    l: $data.scrollTop
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-member-list/uni-im-member-list.js.map
