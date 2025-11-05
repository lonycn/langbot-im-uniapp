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
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const msgPopupControl = () => "../../components/uni-im-msg/popup-control.js";
const toolbar = () => "./toolbar.js";
const _sfc_main = {
  components: {
    msgPopupControl,
    toolbar
  },
  data() {
    return {
      // 当前会话对象
      conversation: {
        id: false,
        leave: false,
        title: ""
      },
      navTitle: "",
      //导航栏标题
      keyboardHeight: 0,
      keyboardMaxHeight: 0,
      answerMsg: false,
      chooseMoreMsg: false,
      checkedMsgList: [],
      // 聊天输入框内容
      chatInputContent: ""
    };
  },
  props: {
    conversation_id: {
      default: ""
    }
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["currentConversationId", "isWidescreen", "systemInfo"])), {
    unread_count() {
      const unreadCount = uni_modules_uniIm_sdk_index.uniIm.conversation.unreadCount();
      return unreadCount;
    },
    //当前用户自己的uid
    current_uid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    extChatTitle() {
      if (this.conversation) {
        return uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("chat-title", this.conversation).filter((result) => result && result.component).map((result) => {
          return {
            component: common_vendor.markRaw(result.component),
            props: result.props || {}
          };
        });
      } else {
        return [];
      }
    },
    answerMsgNote() {
      return uni_modules_uniIm_sdk_index.uniIm.utils.getMsgNote(this.answerMsg);
    },
    answerMsgNickname() {
      return this.answerMsg.nickname || uni_modules_uniIm_sdk_index.uniIm.users.getNickname(this.answerMsg.from_uid);
    }
  }),
  created() {
    this.onImMsg = (res) => {
      if (uni_modules_uniIm_sdk_index.uniIm.isDisabled) {
        return common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/chat.vue:172", "uniIm isDisabled");
      }
      const { data } = res.data.payload;
      if (data.conversation_id == this.currentConversationId && data.from_uid != this.current_uid && uni_modules_uniIm_sdk_index.uniIm.utils.isReadableMsg(data)) {
        this.conversation.clearUnreadCount();
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/chat.vue:184", "聊天页面-收到消息: ", JSON.stringify(res));
        setTimeout(() => {
          var _a;
          (_a = this.$refs["msg-list"]) == null ? void 0 : _a.notifyNewMsg();
        }, 0);
      }
    };
    uni_modules_uniIm_sdk_index.uniIm.onMsg(this.onImMsg);
    this.keyboardMaxHeight = uni_modules_uniIm_sdk_index.uniIm.keyboardMaxHeight || 300;
    this.onKeyboardHeightChange = ({
      height
    }) => {
      this.keyboardHeight = height;
      if (height > this.keyboardMaxHeight) {
        this.keyboardMaxHeight = height;
      }
      this.$nextTick(() => {
        this.showLast();
      });
    };
    common_vendor.index.onKeyboardHeightChange(this.onKeyboardHeightChange);
  },
  mounted() {
  },
  onShow() {
    if (uni_modules_uniIm_sdk_index.uniIm.ext._previewImageIsOpen) {
      return;
    }
    if (this.conversation.id) {
      uni_modules_uniIm_sdk_index.uniIm.currentConversationId = this.conversation.id;
      this.clearUnreadCount();
      this.updateNavTitle();
    }
  },
  onUnload() {
    uni_modules_uniIm_sdk_index.uniIm.offMsg(this.onImMsg);
    common_vendor.index.offKeyboardHeightChange(this.onKeyboardHeightChange);
    uni_modules_uniIm_sdk_index.uniIm.currentConversationId = "";
    uni_modules_uniIm_sdk_index.uniIm.audioContext.stop();
  },
  beforeDestroy() {
    uni_modules_uniIm_sdk_index.uniIm.currentConversationId = "";
    uni_modules_uniIm_sdk_index.uniIm.audioContext.stop();
  },
  onHide() {
    if (uni_modules_uniIm_sdk_index.uniIm.ext._previewImageIsOpen) {
      return;
    }
    uni_modules_uniIm_sdk_index.uniIm.currentConversationId = "";
    uni_modules_uniIm_sdk_index.uniIm.audioContext.stop();
  },
  onLoad(param) {
    for (const key in param) {
      try {
        param[key] = JSON.parse(param[key]);
      } catch (_) {
      }
    }
    this.load(param);
  },
  onBackPress(e) {
    const memberListRef = this.$refs["member-list"];
    if (memberListRef.isShow) {
      memberListRef.hide();
      return true;
    }
  },
  watch: {
    // 监听群昵称变化
    "conversation.title"() {
      this.updateNavTitle();
    },
    // 监听群成员数变化
    "conversation.group.member_count"() {
      this.updateNavTitle();
    }
  },
  methods: {
    load(param) {
      return __async(this, null, function* () {
        yield Promise.all(uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("chat-load-before-extra", param));
        this.answerMsg = false;
        if (this.conversation.id) {
          this.conversation.chatInputContent = this.chatInputContent;
        }
        this.conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(param);
        this.chatInputContent = this.conversation.chatInputContent;
        uni_modules_uniIm_sdk_index.uniIm.currentConversationId = this.conversation.id;
        setTimeout(() => {
          this.$refs["msg-list"].init();
        }, 0);
        this.clearUnreadCount();
      });
    },
    onclickMsgList() {
      var _a;
      (_a = this.$refs["chat-input"]) == null ? void 0 : _a.retract();
      common_vendor.index.hideKeyboard();
    },
    putChatInputContent(value) {
      var _a;
      (_a = this.$refs["chat-input"]) == null ? void 0 : _a.setContent(value);
    },
    uploadFileAndSendMsg({ tempFiles }) {
      tempFiles.forEach((tempFile) => __async(this, null, function* () {
        const {
          path: url,
          name,
          size
        } = tempFile;
        let { fileType } = tempFile;
        if (!["image", "video"].includes(fileType)) {
          fileType = "file";
        }
        const sizeMB = size / 1e3 / 1024;
        if (fileType == "image" && sizeMB > 2) {
          return common_vendor.index.showToast({
            title: "图片大小不能超过2mb",
            icon: "none"
          });
        } else if (sizeMB > 100) {
          return common_vendor.index.showToast({
            title: "文件大小不能超过100mb",
            icon: "none"
          });
        }
        const data = {};
        const fileInfo = {
          url,
          size,
          name
        };
        if (fileType == "image") {
          const { width, height } = yield common_vendor.index.getImageInfo({ src: url });
          fileInfo.width = width;
          fileInfo.height = height;
        }
        data[fileType] = fileInfo;
        let msg = yield this.beforeSendMsg(data, false);
        const uploadFileFn = () => __async(this, null, function* () {
          const result = yield common_vendor.tr.uploadFile({
            filePath: tempFile.path,
            cloudPath: Date.now() + this.current_uid + "." + name.split(".").pop()
          });
          msg.body.url = result.fileID;
        });
        try {
          yield uploadFileFn();
          this.sendMsg(msg);
        } catch (e) {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/chat/chat.vue:471", "uploadFile error:", e);
          msg.__beforeRetriesAction = uploadFileFn;
          msg.state = -200;
        }
      }));
    },
    chooseFileSendMsg(_0) {
      return __async(this, arguments, function* (type, _config = {}) {
        let objFn = {
          "image": () => {
            common_vendor.index.chooseImage({
              // count:9,
              // sourceType,
              // extension,
              success: (res) => beforeUploadFileAndSendMsg(res, "image"),
              "fail": alertFail
            });
          },
          "video": () => {
            common_vendor.index.chooseVideo({
              sourceType: ["camera", "album"],
              success: (res) => beforeUploadFileAndSendMsg(res, "video"),
              "fail": alertFail
            });
          },
          "all": () => {
            let chooseFile = common_vendor.index.chooseFile;
            chooseFile = common_vendor.wx$1.chooseMedia;
            chooseFile({
              type: "all",
              // count:10,
              sourceType: ["album", "camera"],
              "success": this.uploadFileAndSendMsg,
              "fail": alertFail
            });
          }
        };
        objFn[type]();
        const _this = this;
        function beforeUploadFileAndSendMsg(res, fileType) {
          if (fileType == "video") {
            res.tempFile = {
              size: res.size,
              width: res.width,
              height: res.height
            };
            res.tempFile.path = res.tempFilePath;
            res.tempFiles = [res.tempFile];
          }
          res.tempFiles.forEach((item) => {
            if (!item.fileType) {
              item.fileType = fileType;
            }
            if (!item.name) {
              item.name = _this.current_uid + Math.random().toString(36).substr(2) + Date.now();
            }
          });
          _this.uploadFileAndSendMsg(res);
        }
        function alertFail(res) {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/chat/chat.vue:543", "res", res);
        }
      });
    },
    sendSoundMsg(sound) {
      this.beforeSendMsg({ sound });
    },
    onInput(e) {
      this.$refs["member-list"].onChatInput(e);
    },
    intoTopic(msgId) {
      this.$refs["msg-list"].intoTopic(msgId);
    },
    setAnswerMsg(msgId) {
      return __async(this, null, function* () {
        var _a;
        this.answerMsg = this.conversation.msg.find(msgId);
        (_a = this.$refs["chat-input"]) == null ? void 0 : _a.focus();
        const { from_uid } = this.answerMsg;
        if (this.conversation.group && from_uid != this.current_uid) {
          this.setCallAboutUid(from_uid, false);
        }
      });
    },
    chatInputConfirm() {
      return __async(this, null, function* () {
        const $mr = this.$refs["member-list"];
        if ($mr.isShow && $mr.memberList.length) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/chat.vue:585", "正在执行选中要@的人，不发送数据");
          return;
        }
        if (typeof this.chatInputContent == "object") {
          const { data: htmlArray, uploadImg } = this.chatInputContent.getHtmlArray();
          let msg = yield this.beforeSendMsg({
            "rich-text": htmlArray
          }, false);
          const uploadHtmlArrayImgFn = () => __async(this, null, function* () {
            return yield uploadImg(msg.body);
          });
          try {
            yield uploadHtmlArrayImgFn();
            this.sendMsg(msg);
          } catch (e) {
            common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/chat/chat.vue:602", "uploadImg error:", e);
            msg.__beforeRetriesAction = uploadHtmlArrayImgFn;
            msg.state = -200;
          }
        } else {
          this.chatInputContent = this.chatInputContent.replace(/&nbsp;/g, " ").trim();
          yield this.beforeSendMsg();
        }
      });
    },
    showMenberList() {
      this.$refs["member-list"].show(arguments[0]);
    },
    beforeSendMsg() {
      return __async(this, arguments, function* (param = {}, _continue = true) {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/chat.vue:619", "beforeSendMsg", { param });
        let msg = {
          type: "text",
          to_uid: this.conversation.friend_uid,
          conversation_id: this.conversation.id,
          group_id: this.conversation.group_id,
          client_create_time: Date.now(),
          from_uid: this.current_uid,
          state: 0,
          body: this.chatInputContent,
          // 接收消息的appId，默认为当前应用的appId。如果你是2个不同appId的应用相互发，请修改此值为相对的appId
          appId: this.systemInfo.appId
        };
        for (let key in param) {
          if (param[key]) {
            msg.type = key;
            msg.body = JSON.parse(JSON.stringify(param[key]));
          }
        }
        if (msg.type === "text") {
          msg.body = msg.body.trim();
          if (!msg.body.length) {
            this.resetChatInput();
            return common_vendor.index.showToast({
              title: "不能发送空消息",
              icon: "none"
            });
          }
        }
        if (this.answerMsg !== false) {
          msg.about_msg_id = this.answerMsg._id;
        }
        msg = this.conversation.msg.add(msg);
        if (msg.type !== "code") {
          this.resetChatInput();
        }
        this.$nextTick(() => {
          this.showLast();
        });
        if (_continue) {
          this.sendMsg(msg);
        } else {
          return msg;
        }
      });
    },
    resetChatInput() {
      this.chatInputContent = "";
      this.answerMsg = false;
    },
    getCallUid() {
      var _a;
      return ((_a = this.chatInputContent) == null ? void 0 : _a.aboutUserIds) || [];
    },
    sendMsg(msg, callback) {
      if (this.conversation.source) {
        msg.chat_source = this.conversation.source;
      }
      const uniImCo = common_vendor.tr.importObject("uni-im-co", {
        customUI: true
      });
      let tmpBody = JSON.stringify(msg.body);
      if (tmpBody.includes("个推")) {
        msg.body = JSON.parse(tmpBody.replace(/个推/g, "个​推"));
      }
      uniImCo.sendMsg(msg).then((e) => __async(this, null, function* () {
        msg.state = e.errCode === 0 ? 100 : -100;
        msg.create_time = e.data.create_time;
        msg._id = e.data._id;
      })).catch((e) => __async(this, null, function* () {
        common_vendor.index.showModal({
          content: e.message,
          showCancel: false,
          confirmText: "关闭"
        });
        common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/chat/chat.vue:717", "uniImCo.sendMsg error:", e.errCode, e.message);
        msg.state = -200, msg.create_time = Date.now();
      })).finally((e) => {
        if (callback) {
          callback(e);
        }
      });
    },
    retriesSendMsg(msg) {
      return __async(this, null, function* () {
        common_vendor.index.showLoading({
          mask: true
        });
        msg.state = 0;
        if (msg.__beforeRetriesAction) {
          yield msg.__beforeRetriesAction();
        }
        delete msg.__beforeRetriesAction;
        msg.isRetries = true;
        this.sendMsg(msg, (e) => {
          common_vendor.index.hideLoading();
        });
      });
    },
    showLast(duration = 300) {
      let msgListRef = this.$refs["msg-list"];
      if (msgListRef) {
        msgListRef.showLast(duration);
      }
    },
    onLongpressMsgAvatar(user_id) {
      let callUidList = this.getCallUid();
      if (callUidList.includes(user_id)) {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/chat/chat.vue:754", "此用户id已经@过");
        common_vendor.index.showToast({
          title: "此用户已经@过",
          icon: "none"
        });
      } else {
        this.$refs["chat-input"].raiseEditor = true;
        this.$nextTick(() => {
          this.setCallAboutUid(user_id, false);
        });
      }
    },
    setCallAboutUid(user_id, needDeleteLeftART = true) {
      var _a;
      const keywordLength = this.isWidescreen ? this.$refs["member-list"].keyword.length : 0;
      this.$refs["chat-input"].addCallUser({
        user_id,
        nickname: user_id == "__ALL" ? "所有人" : ((_a = uni_modules_uniIm_sdk_index.uniIm.users[user_id]) == null ? void 0 : _a.nickname) || "未知用户"
      }, needDeleteLeftART, keywordLength);
    },
    showControl(_0) {
      return __async(this, arguments, function* ({
        msgId,
        msgContentDomInfo
      }) {
        const msg = this.conversation.msg.find(msgId);
        let isSelf = msg.from_uid == this.current_uid;
        this.$refs["msg-popup-control"].show({ isSelf, msg, msgContentDomInfo });
      });
    },
    shareMsg(msgList, merge = false) {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/chat/chat.vue:783", "msgList", msgList);
      if (this.isWidescreen) {
        this.$refs["share-msg"].open(msgList, merge);
      } else {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-im/pages/share-msg/share-msg",
          success: (res) => {
            res.eventChannel.emit("shareMsg", [msgList, merge]);
          }
        });
      }
      this.chooseMoreMsg = false;
    },
    tapUnreadCount() {
      common_vendor.index.navigateBack();
    },
    updateNavTitle() {
      var _a;
      this.navTitle = this.conversation.title;
      const group_id = (_a = this.conversation) == null ? void 0 : _a.group_id;
      if (group_id && (group_id == null ? void 0 : group_id.indexOf("__tmp")) != 0) {
        this.navTitle += `（${this.conversation.group.member_count}）`;
      }
      if (this.navTitle && !this.isWidescreen) {
        common_vendor.index.setNavigationBarTitle({
          title: this.navTitle
        });
      }
    },
    clearUnreadCount() {
      if (this.conversation.unread_count > 0) {
        this.conversation.clearUnreadCount();
      }
    }
  },
  onNavigationBarButtonTap(e) {
    if (e.index === 0) {
      if (this.conversation.group_id) {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-im/pages/group/info?conversation_id=" + this.conversation.id
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/uni_modules/uni-im/pages/chat/info?user_id=${this.conversation.friend_uid}&conversation_id=${this.conversation.id}`
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_im_msg_list2 = common_vendor.resolveComponent("uni-im-msg-list");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_chat_input2 = common_vendor.resolveComponent("uni-im-chat-input");
  const _component_toolbar = common_vendor.resolveComponent("toolbar");
  const _component_msg_popup_control = common_vendor.resolveComponent("msg-popup-control");
  const _easycom_uni_im_member_list2 = common_vendor.resolveComponent("uni-im-member-list");
  (_easycom_uni_im_msg_list2 + _easycom_uni_icons2 + _easycom_uni_im_chat_input2 + _component_toolbar + _component_msg_popup_control + _easycom_uni_im_member_list2)();
}
const _easycom_uni_im_msg_list = () => "../../components/uni-im-msg-list/uni-im-msg-list.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_chat_input = () => "../../components/uni-im-chat-input/uni-im-chat-input.js";
const _easycom_uni_im_member_list = () => "../../components/uni-im-member-list/uni-im-member-list.js";
if (!Math) {
  (_easycom_uni_im_msg_list + _easycom_uni_icons + _easycom_uni_im_chat_input + _easycom_uni_im_member_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.sr("msg-list", "7ea0bed8-0"),
    b: common_vendor.o($options.showControl),
    c: common_vendor.o($options.onLongpressMsgAvatar),
    d: common_vendor.o($options.retriesSendMsg),
    e: common_vendor.o($options.putChatInputContent),
    f: common_vendor.o($options.showMenberList),
    g: common_vendor.o($options.onclickMsgList),
    h: common_vendor.p({
      conversationId: $data.conversation.id,
      chooseMore: $data.chooseMoreMsg,
      checkedMsgList: $data.checkedMsgList
    }),
    i: $data.conversation.leave
  }, $data.conversation.leave ? {} : $data.conversation.isMuteAllMembers ? {} : common_vendor.e({
    k: $data.answerMsg !== false
  }, $data.answerMsg !== false ? {
    l: common_vendor.t($options.answerMsgNickname),
    m: common_vendor.t($options.answerMsgNote),
    n: common_vendor.o(($event) => $data.answerMsg = false),
    o: common_vendor.p({
      type: "clear",
      color: "#ccc",
      size: "18px"
    })
  } : {}, {
    p: common_vendor.sr("chat-input", "7ea0bed8-1"),
    q: common_vendor.o($options.chatInputConfirm),
    r: common_vendor.o($options.onInput),
    s: common_vendor.o($options.sendSoundMsg),
    t: common_vendor.o($options.beforeSendMsg),
    v: common_vendor.o($options.showMenberList),
    w: common_vendor.o(($event) => $data.chatInputContent = $event),
    x: common_vendor.p({
      keyboardMaxHeight: $data.keyboardMaxHeight,
      keyboardHeight: $data.keyboardHeight,
      modelValue: $data.chatInputContent
    }),
    y: common_vendor.o(($event) => $options.shareMsg($data.checkedMsgList, $event)),
    z: common_vendor.o(($event) => $data.chooseMoreMsg = $event),
    A: common_vendor.p({
      modelValue: $data.chooseMoreMsg
    }),
    B: common_vendor.o(() => {
    })
  }), {
    j: $data.conversation.isMuteAllMembers,
    C: common_vendor.sr("msg-popup-control", "7ea0bed8-4"),
    D: common_vendor.o($options.setAnswerMsg),
    E: common_vendor.o($options.intoTopic),
    F: common_vendor.o($options.shareMsg),
    G: common_vendor.o(($event) => {
      $data.chooseMoreMsg = true;
      $data.checkedMsgList = $event;
    }),
    H: common_vendor.sr("member-list", "7ea0bed8-5"),
    I: common_vendor.p({
      conversationId: $data.conversation.id
    }),
    J: _ctx.isWidescreen ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/chat/chat.js.map
