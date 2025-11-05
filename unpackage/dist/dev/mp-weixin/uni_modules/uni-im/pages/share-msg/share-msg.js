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
const _sfc_main = {
  name: "UniImShareMsg",
  emits: ["close"],
  props: {
    noMsgList: {
      // 不显示转发的消息列表
      type: Boolean,
      default: false
    },
    noComment: {
      // 不显示留言
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputText: "",
      keyword: "",
      checkedList: [],
      isOpen: false,
      msgList: [],
      merge: false,
      canSend: false
    };
  },
  computed: __spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])),
  watch: {
    checkedList: {
      handler(val) {
        this.canSend = val.length > 0;
      },
      immediate: true,
      deep: true
    }
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("shareMsg", ([msgList, merge]) => {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:168", "shareMsg", msgList, merge);
      this.open(msgList, merge);
    });
  },
  methods: {
    open(msgList, merge) {
      common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:174", "msgList", msgList);
      this.isOpen = true;
      this.merge = merge;
      this.msgList = msgList.map((msg) => {
        let data = Object.assign({}, msg);
        delete data._id;
        if (!merge) {
          data.conversation_id = "";
          data.group_id = "";
        }
        return data;
      });
    },
    removeCheckedItem(index) {
      this.checkedList.splice(index, 1);
    },
    close() {
      this.isOpen = false;
      this.checkedList = [];
      this.inputText = "";
      if (!this.isWidescreen) {
        common_vendor.index.navigateBack();
      }
    },
    createMsg(msg, conversation) {
    },
    viewMsg() {
      common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:204", "viewMsg", this.msgList);
      this.$refs["view-msg"].open(this.msgList);
    },
    send() {
      return __async(this, null, function* () {
        common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:208", "send", this.checkedList);
        common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:209", "this.msgList", this.msgList);
        if (!this.merge && this.inputText.length != 0) {
          this.msgList.push({
            "body": this.inputText,
            "type": "text"
          });
        }
        for (var cidIndex = 0; cidIndex < this.checkedList.length; cidIndex++) {
          const conversation = this.checkedList[cidIndex];
          const {
            friend_uid,
            group_id,
            id: conversation_id
          } = conversation;
          const baseMsgInfo = {
            "to_uid": friend_uid,
            conversation_id,
            group_id,
            "from_uid": uni_modules_uniIm_sdk_index.uniIm.currentUser._id,
            "state": 0,
            "client_create_time": Date.now(),
            "is_read": false,
            // 接收消息的appId，默认为当前应用的appId。如果你是2个不同appId的应用相互发，请修改此值为相对的appId
            appId: uni_modules_uniIm_sdk_index.uniIm.systemInfo.appId
          };
          if (this.merge) {
            let msg = Object.assign(baseMsgInfo, {
              "type": "history",
              "body": {
                "title": this.msgList[0].group_id ? "群聊天记录" : "",
                // 是否转带真实群名称待定
                "msgList": JSON.parse(JSON.stringify(this.msgList))
              }
            });
            common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:245", "msg", msg);
            yield sendMsgToConversation(conversation, msg);
            if (this.merge && this.inputText.length != 0) {
              yield sendMsgToConversation(conversation, __spreadProps(__spreadValues({}, baseMsgInfo), {
                "body": this.inputText,
                "type": "text"
              }));
            }
          } else {
            for (let msgIndex = 0; msgIndex < this.msgList.length; msgIndex++) {
              let msg = JSON.parse(JSON.stringify(this.msgList[msgIndex]));
              msg = Object.assign(msg, baseMsgInfo);
              yield sendMsgToConversation(conversation, msg);
            }
          }
        }
        this.close();
        function sendMsgToConversation(conversation, msg) {
          return __async(this, null, function* () {
            msg = conversation.msg.add(msg);
            const uniImCo = common_vendor.tr.importObject("uni-im-co");
            yield uniImCo.sendMsg(msg).then((e) => __async(this, null, function* () {
              common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:272", "uniImCo.sendMsg", e);
              msg.state = e.errCode === 0 ? 100 : -100;
              msg.create_time = e.data.create_time;
              msg._id = e.data._id;
            })).catch((e) => __async(this, null, function* () {
              common_vendor.index.showModal({
                content: e.message,
                showCancel: false,
                confirmText: "关闭"
              });
              common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/share-msg/share-msg.vue:283", "uniImCo.sendMsg error:", e.errCode, e.message);
              msg.create_time = Date.now();
              msg.state = -200;
            }));
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_im_conversation_list2 = common_vendor.resolveComponent("uni-im-conversation-list");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_im_view_msg2 = common_vendor.resolveComponent("uni-im-view-msg");
  (_easycom_uni_search_bar2 + _easycom_uni_im_conversation_list2 + _easycom_uni_icons2 + _easycom_uni_list_item2 + _easycom_uni_im_view_msg2)();
}
const _easycom_uni_search_bar = () => "../../../uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_im_conversation_list = () => "../../components/uni-im-conversation-list/uni-im-conversation-list.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_list_item = () => "../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_im_view_msg = () => "../../components/uni-im-view-msg/uni-im-view-msg.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_im_conversation_list + _easycom_uni_icons + _easycom_uni_list_item + _easycom_uni_im_view_msg)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isOpen
  }, $data.isOpen ? common_vendor.e({
    b: !_ctx.isWidescreen
  }, !_ctx.isWidescreen ? common_vendor.e({
    c: common_vendor.o((...args) => $options.close && $options.close(...args)),
    d: $data.canSend
  }, $data.canSend ? {
    e: common_vendor.t($data.checkedList.length),
    f: common_vendor.o((...args) => $options.send && $options.send(...args))
  } : {}) : {}, {
    g: common_vendor.o(($event) => $data.keyword = $event),
    h: common_vendor.p({
      id: "search-bar",
      radius: "5",
      placeholder: "搜索会话",
      ["clear-button"]: "auto",
      ["cancel-button"]: "none",
      modelValue: $data.keyword
    }),
    i: common_vendor.o(($event) => $data.checkedList = $event),
    j: common_vendor.p({
      id: "conversation-list-box",
      keyword: $data.keyword,
      ["can-check"]: true,
      ["show-unread-count"]: false,
      ["checked-list"]: $data.checkedList
    }),
    k: _ctx.isWidescreen
  }, _ctx.isWidescreen ? common_vendor.e({
    l: common_vendor.f($data.checkedList, (item, index, i0) => {
      return {
        a: item.avatar_file && item.avatar_file.url ? item.avatar_file.url : "/uni_modules/uni-im/static/avatarUrl.png",
        b: common_vendor.t(item.title),
        c: common_vendor.o(($event) => $options.removeCheckedItem(index), index),
        d: "28849800-2-" + i0,
        e: index
      };
    }),
    m: common_vendor.p({
      type: "clear",
      color: "#ccc"
    }),
    n: !$props.noMsgList
  }, !$props.noMsgList ? {
    o: common_vendor.o($options.viewMsg),
    p: common_vendor.p({
      title: "转发的消息内容",
      link: true
    })
  } : {}, {
    q: !$props.noComment
  }, !$props.noComment ? {
    r: $data.inputText,
    s: common_vendor.o(($event) => $data.inputText = $event.detail.value)
  } : {}, {
    t: common_vendor.o((...args) => $options.close && $options.close(...args)),
    v: $data.checkedList.length === 0,
    w: common_vendor.o((...args) => $options.send && $options.send(...args))
  }) : {}, {
    x: !$props.noMsgList
  }, !$props.noMsgList ? {
    y: common_vendor.sr("view-msg", "28849800-4")
  } : {}, {
    z: common_vendor.o(() => {
    }),
    A: common_vendor.o((...args) => $options.close && $options.close(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/share-msg/share-msg.js.map
