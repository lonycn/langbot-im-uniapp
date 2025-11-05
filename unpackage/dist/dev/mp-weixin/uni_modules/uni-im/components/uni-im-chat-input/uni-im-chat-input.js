"use strict";
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
const uni_modules_uniIm_components_uniImChatInput_emojiCodes = require("./emojiCodes.js");
let currentModelValue = "";
const _sfc_main = {
  name: "uni-im-chat-input",
  emits: ["update:modelValue", "confirm", "input", "sendSoundMsg", "sendCodeMsg", "showMenberList"],
  data() {
    return {
      bHeight: uni_modules_uniIm_sdk_index.uniIm.systemInfo.safeAreaInsets.bottom / 2,
      raiseEditor: false,
      mode: false,
      menuIsShow: false,
      menuList: [
        {
          "title": "图片",
          "iconCode": "e7be"
        },
        {
          "title": "视频",
          "iconCode": "e690"
        },
        {
          "title": "文件",
          "iconCode": "e69e"
        }
      ],
      emojiCodes: uni_modules_uniIm_components_uniImChatInput_emojiCodes.emojiCodes,
      chatInputBoxHeight: "auto"
    };
  },
  computed: {
    showMediaBox() {
      return this.mode && this.mode != "sound";
    },
    emojiIsShow() {
      return this.mode == "emoji";
    },
    soundIsShow: {
      get() {
        return this.mode == "sound";
      },
      set(value) {
        this.mode = value ? "sound" : false;
      }
    },
    canSend() {
      return typeof this.modelValue != "string" || this.modelValue.trim().length > 0;
    }
  },
  props: {
    modelValue: {
      type: [String, Object],
      default: ""
    },
    keyboardMaxHeight: {
      type: Number,
      default: 0
    },
    keyboardHeight: {
      type: Number,
      default: 0
    },
    hideKeyboard: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    currentModelValue = this.modelValue;
  },
  watch: {
    modelValue: {
      handler(modelValue, oldValue) {
        if (JSON.stringify(currentModelValue) != JSON.stringify(modelValue)) {
          const { html } = modelValue;
          this.setContent(html ? { html } : modelValue);
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    clickEditor() {
      if (this.mode != "input") {
        this.changeMode("input");
      }
    },
    sendSoundMsg(e) {
      this.$emit("sendSoundMsg", e);
    },
    sendCodeMsg(e) {
      this.$emit("sendCodeMsg", e);
    },
    showMenberList(e) {
      this.$emit("showMenberList", e);
    },
    oninput(e) {
      currentModelValue = e.value;
      this.$emit("update:modelValue", e.value);
      this.$emit("input", e);
    },
    updateModelValue({ value }) {
      this.$emit("update:modelValue", value);
    },
    focus() {
      this.$refs.editor.callRmd("$focus");
    },
    addCallUser(_0) {
      return __async(this, arguments, function* ({ user_id, nickname }, needDeleteLeftART = true, DL = 0) {
        this.soundIsShow = false;
        this.raiseEditor = true;
        setTimeout(() => this.raiseEditor = false, 2e3);
        if (needDeleteLeftART) {
          this.$refs.editor.callRmd("$deleteLeftChar", 1 + DL);
        } else {
          yield uni_modules_uniIm_sdk_index.uniIm.utils.sleep(100);
          this.$refs.editor.callRmd("$focus");
        }
        yield uni_modules_uniIm_sdk_index.uniIm.utils.sleep(10);
        const html = `<span class="nickname" contenteditable="false" user_id="${user_id}">@${nickname}</span>&nbsp;`;
        this.addHtmlToCursor(html);
      });
    },
    retract() {
      if (![false, "sound"].includes(this.mode)) {
        this.mode = false;
      }
    },
    changeMode(type) {
      this.mode = this.mode === type ? "input" : type;
      if (this.mode === "input") {
        this.$refs.editor.focus();
      }
    },
    clickEmojiItem(uniCodeEmoji, event) {
      this.addHtmlToCursor(uniCodeEmoji, false);
    },
    addHtmlToCursor(html, focus = true) {
      this.$refs.editor.callRmd("$addHtmlToCursor", html, focus);
    },
    setContent(content) {
      this.$refs.editor.callRmd("$setContent", content);
    },
    clickMenu(index, event) {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-chat-input/uni-im-chat-input.vue:316", "clickMenu", index, event);
      let parrent = this.$parent;
      if (index < 2) {
        parrent.chooseFileSendMsg(index === 0 ? "image" : "video");
      }
      if (index === 2) {
        parrent.chooseFileSendMsg("all");
      }
    },
    confirm() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-chat-input/uni-im-chat-input.vue:336", "confirm");
      this.$emit("confirm");
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  const _easycom_uni_im_sound2 = common_vendor.resolveComponent("uni-im-sound");
  const _easycom_uni_im_editor2 = common_vendor.resolveComponent("uni-im-editor");
  (_easycom_uni_im_icons2 + _easycom_uni_im_sound2 + _easycom_uni_im_editor2)();
}
const _easycom_uni_im_icons = () => "../uni-im-icons/uni-im-icons.js";
const _easycom_uni_im_sound = () => "../uni-im-sound/uni-im-sound.js";
const _easycom_uni_im_editor = () => "../uni-im-editor/uni-im-editor.js";
if (!Math) {
  (_easycom_uni_im_icons + _easycom_uni_im_sound + _easycom_uni_im_editor)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.menuList, (item, index, i0) => {
      return {
        a: index,
        b: common_vendor.o(($event) => $options.clickMenu(index, $event), index),
        c: "1bb68f14-0-" + i0,
        d: common_vendor.p({
          title: `选择${item.title}，并发送`,
          code: item.iconCode,
          size: "24",
          color: "#666666"
        })
      };
    }),
    b: common_vendor.o(($event) => $options.changeMode("sound")),
    c: common_vendor.p({
      code: $options.soundIsShow ? "e69f" : "e684",
      size: "30"
    }),
    d: $options.soundIsShow,
    e: common_vendor.o($options.sendSoundMsg),
    f: common_vendor.sr("editor", "1bb68f14-3"),
    g: common_vendor.o($options.clickEditor),
    h: common_vendor.o(() => {
    }),
    i: !$options.soundIsShow,
    j: common_vendor.o($options.oninput),
    k: common_vendor.o($options.confirm),
    l: common_vendor.o($options.updateModelValue),
    m: common_vendor.p({
      hideKeyboard: $options.emojiIsShow
    }),
    n: common_vendor.o(($event) => $options.changeMode("emoji")),
    o: common_vendor.p({
      code: $options.emojiIsShow ? "e69f" : "e646",
      size: "30"
    }),
    p: !$options.soundIsShow && $options.canSend
  }, !$options.soundIsShow && $options.canSend ? {
    q: common_vendor.o((...args) => $options.confirm && $options.confirm(...args))
  } : {
    r: common_vendor.o(($event) => $options.changeMode("menu")),
    s: common_vendor.p({
      code: "e75a",
      size: "30"
    })
  }, {
    t: $options.showMediaBox
  }, $options.showMediaBox ? common_vendor.e({
    v: $data.mode == "menu"
  }, $data.mode == "menu" ? {
    w: common_vendor.f($data.menuList, (item, index, i0) => {
      return {
        a: "1bb68f14-6-" + i0,
        b: common_vendor.p({
          code: item.iconCode,
          size: "26"
        }),
        c: common_vendor.t(item.title),
        d: index,
        e: common_vendor.o(($event) => $options.clickMenu(index, $event), index)
      };
    })
  } : {}, {
    x: $options.emojiIsShow
  }, $options.emojiIsShow ? {
    y: common_vendor.f($data.emojiCodes, (uniCodeEmoji, index, i0) => {
      return {
        a: common_vendor.t(uniCodeEmoji),
        b: index,
        c: common_vendor.o(($event) => $options.clickEmojiItem(uniCodeEmoji, $event), index)
      };
    })
  } : {}, {
    z: $props.keyboardMaxHeight - $data.bHeight + "px"
  }) : $data.raiseEditor || $props.keyboardHeight ? {
    B: $props.keyboardMaxHeight - $data.bHeight + "px"
  } : {}, {
    A: $data.raiseEditor || $props.keyboardHeight,
    C: $data.bHeight + "px",
    D: common_vendor.o((...args) => $options.confirm && $options.confirm(...args)),
    E: !$options.canSend,
    F: $data.chatInputBoxHeight
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-chat-input/uni-im-chat-input.js.map
