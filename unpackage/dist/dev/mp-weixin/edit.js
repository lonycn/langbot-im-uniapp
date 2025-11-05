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
const common_vendor = require("./common/vendor.js");
const uni_modules_uniIm_sdk_index = require("./uni_modules/uni-im/sdk/index.js");
const dbJQL = common_vendor.tr.databaseForJQL();
const _sfc_main = {
  data() {
    return {
      where: {
        group_id: ""
      },
      imgSrcMap: {},
      // 文本框原始内容
      inputContent: "",
      orginContent: ""
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    isUpdate() {
      return this.inputContent != "" && JSON.stringify(this.inputContent) != JSON.stringify(this.orginContent);
    }
  }),
  onLoad(param) {
    this.$nextTick(() => {
      this.load(param);
    });
  },
  methods: {
    load(param, eventChannel) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        this.orginContent = "";
        this.imgSrcMap = {};
        this.inputContent = "";
        if (this.isWidescreen) {
          this.getOpenerEventChannel = () => {
            return {
              emit: (name, data) => {
                eventChannel[name](data);
              }
            };
          };
        }
        Object.assign(this.where, param);
        if (this.where._id) {
          const res = yield dbJQL.collection("uni-im-group-notice").where(this.where).get();
          const content = (_a = res.data[0]) == null ? void 0 : _a.content.body;
          if (Array.isArray(content)) {
            for (let i = 0; i < content.length; i++) {
              if (content[i].name === "img" && ((_c = (_b = content[i]) == null ? void 0 : _b.attrs) == null ? void 0 : _c.src.indexOf("qiniu://")) === 0) {
                const src = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(content[i].attrs.src);
                this.imgSrcMap[src] = content[i].attrs.src;
                content[i].attrs.src = src;
              }
            }
          }
          this.$refs["group-notice-editor"].callRmd("$setContent", content);
        }
      });
    },
    comfrom() {
      return __async(this, null, function* () {
        var _a;
        common_vendor.index.showLoading({ mask: true });
        const content = yield this.getNoticeContent();
        const eventChannel = (_a = this.getOpenerEventChannel) == null ? void 0 : _a.call(this);
        const noticeCollection = dbJQL.collection("uni-im-group-notice");
        try {
          if (this.where._id) {
            const res = yield noticeCollection.where(this.where).update({
              content
            });
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/notice/edit.vue:91", "res", res, eventChannel);
            eventChannel.emit("update", {
              _id: this.where._id,
              content
            });
          } else {
            const res = yield noticeCollection.add({
              content,
              group_id: this.where.group_id
            });
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/notice/edit.vue:102", "res", res);
            eventChannel.emit("add", {
              _id: res.id,
              content,
              group_id: this.where.group_id,
              user_id: uni_modules_uniIm_sdk_index.uniIm.currentUser._id,
              create_time: Date.now()
            });
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/group/notice/edit.vue:112", "e", e);
          common_vendor.index.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
        common_vendor.index.hideLoading();
        this.navigateBack();
      });
    },
    navigateBack() {
      if (this.isWidescreen) {
        this.$emit("back");
      } else {
        common_vendor.index.navigateBack();
      }
    },
    getNoticeContent() {
      return __async(this, null, function* () {
        let msg = {
          "from_uid": "system",
          "type": "text",
          "body": this.inputContent
        };
        if (typeof this.inputContent == "object") {
          msg = {
            "type": "rich-text",
            body: yield this.inputContent.getHtmlArray().uploadImg()
          };
        } else {
          this.inputContent = this.inputContent.replace(/&nbsp;/g, " ").trim();
        }
        return msg;
      });
    },
    onEditorInput(e) {
      this.inputContent = e.value;
      if (this.orginContent === "") {
        this.orginContent = e.value;
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_im_editor2 = common_vendor.resolveComponent("uni-im-editor");
  _easycom_uni_im_editor2();
}
const _easycom_uni_im_editor = () => "./uni_modules/uni-im/components/uni-im-editor/uni-im-editor.js";
if (!Math) {
  _easycom_uni_im_editor();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.isWidescreen
  }, _ctx.isWidescreen ? {
    b: common_vendor.t($data.where._id ? "编辑" : "新建")
  } : {}, {
    c: common_vendor.sr("group-notice-editor", "9d05df0c-0"),
    d: common_vendor.o($options.onEditorInput),
    e: common_vendor.p({
      ["enter-send"]: false
    }),
    f: common_vendor.o((...args) => $options.navigateBack && $options.navigateBack(...args)),
    g: common_vendor.t($data.where._id ? "更新" : "发布"),
    h: common_vendor.o((...args) => $options.comfrom && $options.comfrom(...args)),
    i: !($data.where._id ? $options.isUpdate : $data.inputContent)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/edit.js.map
