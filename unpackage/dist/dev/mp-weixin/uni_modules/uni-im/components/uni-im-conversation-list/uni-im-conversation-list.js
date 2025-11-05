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
const db = common_vendor.tr.database();
const _sfc_main = {
  emits: ["change", "clickItem", "onScroll", "update:checkedList"],
  props: {
    keyword: {
      type: String,
      default: ""
    },
    activeConversationId: {
      type: [String, Boolean],
      default: ""
    },
    canCheck: {
      type: Boolean,
      default: false
    },
    checkedList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listScrollTop: 0,
      focusConversationId: "",
      activeTypeId: "all"
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen", "conversation"])), {
    loadMoreContentText() {
      return {
        contentrefresh: "正在加载...",
        contentnomore: this.conversationList.length ? "没有更多数据了" : "没有会话数据"
      };
    },
    conversationList() {
      const action = uni_modules_uniIm_sdk_index.uniIm.conversation.typeList.reduce((acc, item) => {
        acc[item.value] = item.filter;
        return acc;
      }, {});
      const needKeepType = uni_modules_uniIm_sdk_index.uniIm.conversation.typeList.filter((i) => i.needKeep).map((i) => i.value);
      const conversationList = uni_modules_uniIm_sdk_index.uniIm.conversation.dataList.filter((i) => !i.hidden).filter((conversation) => {
        var _a, _b, _c;
        if (typeof this.activeTypeId === "object" && Object.keys(this.activeTypeId)[0] === "group_type") {
          return ((_a = conversation.group) == null ? void 0 : _a.type) === this.activeTypeId.group_type;
        } else {
          return ((_b = action[this.activeTypeId]) == null ? void 0 : _b.call(action, conversation)) || ((_c = this.needKeepCid) == null ? void 0 : _c.includes(conversation.id));
        }
      });
      if (needKeepType.includes(this.activeTypeId)) {
        this.needKeepCid = conversationList == null ? void 0 : conversationList.map((i) => i.id);
      }
      return conversationList;
    }
  }),
  watch: {
    // 如果切换了会话类型，需要清空needKeepCid
    activeTypeId() {
      this.needKeepCid = [];
    },
    conversationList: {
      handler() {
        this.$emit("change", this.conversationList);
      },
      deep: true
    },
    activeConversationId(activeConversationId) {
    }
  },
  mounted() {
    return __async(this, null, function* () {
    });
  },
  methods: {
    showCallMeConversationList() {
      uni_modules_uniIm_sdk_index.uniIm.ext.showCallMeConversationList = true;
    },
    changeType(tagId) {
      this.activeTypeId = tagId;
      uni_modules_uniIm_sdk_index.uniIm.conversation.hasMore = true;
      uni_modules_uniIm_sdk_index.uniIm.conversation.loadMore.type = tagId;
      this.listScrollTop = "";
      this.$nextTick(() => {
        this.listScrollTop = 0;
      });
      this.loadMore();
    },
    onScroll(e) {
      e.detail.scrollTop;
      this.$emit("onScroll", e);
      this.onScroll.isScrolling = true;
      clearTimeout(this.onScroll.timer);
      this.onScroll.timer = setTimeout(() => {
        this.onScroll.isScrolling = false;
      }, 500);
    },
    isCheck(item) {
      return this.checkedList.some((i) => i.id === item.id);
    },
    clickItem(item) {
      if (this.canCheck) {
        let checkedList = this.checkedList;
        if (this.isCheck(item)) {
          checkedList.splice(checkedList.findIndex((i) => i.id === item.id), 1);
        } else {
          checkedList.push(item);
        }
        this.$emit("update:checkedList", checkedList);
      }
      this.$emit("clickItem", item);
    },
    openConversationMenu(e, index) {
      let conversation = this.conversationList[index];
      this.focusConversationId = conversation.id;
      const myContextmenu = this.$refs["uni-im-contextmenu"];
      const clientY = e.clientY || e.changedTouches[0].clientY;
      const clientX = e.clientX || e.changedTouches[0].clientX;
      const position = {
        "top": clientY + 35,
        "left": clientX
      };
      let menuList = [
        {
          "title": conversation.pinned ? "取消置顶" : "置顶",
          "action": () => {
            conversation.pinned = !conversation.pinned;
            db.collection("uni-im-conversation").doc(conversation._id).update({
              "pinned": conversation.pinned
            }).then((e2) => {
              common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-conversation-list/uni-im-conversation-list.vue:250", "updated 置顶", e2.result.updated, conversation._id);
            }).catch(() => {
              common_vendor.index.showToast({
                title: "服务端错误，置顶失败，请稍后重试",
                icon: "none"
              });
              conversation.pinned = !conversation.pinned;
            });
          }
        },
        {
          "title": "标为" + (conversation.unread_count ? "已读" : "未读"),
          "action": () => {
            conversation.setUnreadCount(conversation.unread_count ? 0 : 1);
          }
        },
        {
          "title": (conversation.is_star ? "取消" : "设为") + "星标",
          "action": () => {
            conversation.changeIsStar();
          }
        },
        {
          "title": conversation.mute ? "允许消息通知" : "消息免打扰",
          "action": () => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-conversation-list/uni-im-conversation-list.vue:276", "mute 允许消息通知 / 消息免打扰");
            conversation.changeMute();
          }
        },
        // {
        //   "title":"复制会话id",
        //   "action":()=>{
        //      uni.setClipboardData({
        //        data:conversation.id,
        //        showToast:false
        //      })
        //   }
        // },
        {
          "title": "移除会话",
          "action": () => conversation.hide()
        }
      ];
      myContextmenu.show(position, menuList);
      myContextmenu.onClose(() => {
        this.focusConversationId = "";
      });
    },
    closeConversationMenu() {
      const myContextmenu = this.$refs["uni-im-contextmenu"];
      myContextmenu.closeMe();
    },
    loadMore() {
      return __async(this, null, function* () {
        let data = yield uni_modules_uniIm_sdk_index.uniIm.conversation.loadMore();
        return data;
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_conversation2 = common_vendor.resolveComponent("uni-im-conversation");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_uni_im_contextmenu2 = common_vendor.resolveComponent("uni-im-contextmenu");
  (_easycom_uni_icons2 + _easycom_uni_im_conversation2 + _easycom_uni_im_load_state2 + _easycom_uni_im_contextmenu2)();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_conversation = () => "../uni-im-conversation/uni-im-conversation.js";
const _easycom_uni_im_load_state = () => "../uni-im-load-state/uni-im-load-state.js";
const _easycom_uni_im_contextmenu = () => "../uni-im-contextmenu/uni-im-contextmenu.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_im_conversation + _easycom_uni_im_load_state + _easycom_uni_im_contextmenu)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f(_ctx.conversation.typeList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: index,
        c: common_vendor.o(($event) => $options.changeType(item.value), index),
        d: $data.activeTypeId === item.value ? 1 : ""
      };
    }),
    b: common_vendor.f($options.conversationList, (item, index, i0) => {
      return common_vendor.e($props.canCheck ? common_vendor.e({
        a: $options.isCheck(item)
      }, $options.isCheck(item) ? {
        b: "8787f41c-1-" + i0 + "," + ("8787f41c-0-" + i0),
        c: common_vendor.p({
          color: "#FFF",
          type: "checkmarkempty"
        })
      } : {}, {
        d: $options.isCheck(item) ? 1 : ""
      }) : {}, {
        e: item.id,
        f: common_vendor.o(($event) => $options.clickItem(item), item.id),
        g: common_vendor.o(($event) => $options.openConversationMenu($event, index), item.id),
        h: common_vendor.o(($event) => $options.onScroll.isScrolling ? "" : $options.openConversationMenu($event, index), item.id),
        i: "8787f41c-0-" + i0,
        j: common_vendor.p({
          conversation: item,
          id: item.id
        }),
        k: item.id,
        l: $props.activeConversationId == item.id ? 1 : "",
        m: $data.focusConversationId === item.id ? 1 : ""
      });
    }),
    c: $props.canCheck,
    d: !$props.keyword
  }, !$props.keyword ? {
    e: common_vendor.p({
      ["content-text"]: $options.loadMoreContentText,
      status: _ctx.conversation.hasMore ? "loading" : "noMore"
    })
  } : $options.conversationList.length === 0 ? {} : {}, {
    f: $options.conversationList.length === 0,
    g: $props.canCheck ? 1 : "",
    h: $data.listScrollTop,
    i: common_vendor.o(($event) => _ctx.conversation.loading ? "" : $options.loadMore()),
    j: common_vendor.o((...args) => $options.onScroll && $options.onScroll(...args)),
    k: common_vendor.sr("uni-im-contextmenu", "8787f41c-3"),
    l: _ctx.isWidescreen && $data.activeTypeId === "has_remind_msg"
  }, _ctx.isWidescreen && $data.activeTypeId === "has_remind_msg" ? {
    m: common_vendor.p({
      type: "calendar",
      color: "#888",
      size: "20"
    }),
    n: common_vendor.p({
      type: "right"
    }),
    o: common_vendor.o((...args) => $options.showCallMeConversationList && $options.showCallMeConversationList(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-conversation-list/uni-im-conversation-list.js.map
