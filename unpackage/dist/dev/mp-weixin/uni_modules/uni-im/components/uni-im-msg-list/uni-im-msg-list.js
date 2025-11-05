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
const uniImList = () => "./components/uni-im-list/uni-im-list.js";
const filterContorl = () => "./components/filter-contorl/filter-contorl.js";
let currentScrollTop = 0;
let appearObj = {};
const _sfc_main = {
  components: {
    uniImList,
    filterContorl
  },
  emits: ["checkedMsgList", "update:checkedMsgList", "longpressMsgAvatar", "showControl", "clickItem", "retriesSendMsg", "putChatInputContent", "showMenberList"],
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["systemInfo", "isWidescreen"])), {
    loadStatus() {
      return this.conversation.msg.hasMore ? "loading" : "noMore";
    },
    visibleMsgList() {
      const visibleMsgList = this.conversation.msg.visibleDataList();
      this.$nextTick(() => {
        uni_modules_uniIm_sdk_index.uniIm.utils.throttle(this.setIntersectionObserver, 1e3);
      });
      if (this.filterAsUid.length > 0) {
        return visibleMsgList.filter((i) => this.filterAsUid.includes(i.from_uid));
      }
      return visibleMsgList;
    },
    //当前用户自己的uid
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    }
  }),
  data() {
    return {
      conversation: {
        msg: {
          hasMore: true,
          visibleDataList: () => []
        },
        unread_group_notice_id: false,
        group_info: {
          notification: false
        }
      },
      lastMsgIsShow: true,
      scrollIntoView: "",
      scrollTop: 0,
      hasNewMsg: false,
      remind_msg_ids: [],
      activeMsgId: "",
      filterAsUid: []
    };
  },
  watch: {
    "conversation.remind_msg_ids"(remind_msg_ids) {
      this.remind_msg_ids = remind_msg_ids;
    },
    "conversation.unread_group_notice_id": {
      handler(notice_id) {
        return __async(this, null, function* () {
          if (notice_id) {
            this.$refs["uni-im-group-notice-popup"].open({
              group_id: this.conversation.group_id,
              notice_id
            });
          }
        });
      },
      immediate: true
    },
    filterAsUid(filterAsUid, old) {
      this.$refs["filter-contorl"].userIdList = filterAsUid;
      const { msg } = this.conversation;
      msg.reset();
      if (filterAsUid.length === 0) {
        msg.preWhere = false;
      } else {
        msg.preWhere = {
          from_uid: common_vendor.tr.databaseForJQL().command.in(filterAsUid)
        };
      }
      this.loadMore(() => {
        this.showLast();
      });
    }
  },
  props: {
    conversationId: {
      default() {
        return false;
      }
    },
    chooseMore: {
      default: false
    },
    checkedMsgList: {
      default() {
        return [];
      }
    }
  },
  mounted() {
    return __async(this, null, function* () {
    });
  },
  destroyed() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  },
  methods: {
    init() {
      return __async(this, null, function* () {
        if (this.intersectionObserver) {
          this.intersectionObserver.disconnect();
        }
        this.conversation = uni_modules_uniIm_sdk_index.uniIm.conversation.find(this.conversationId);
        this.lastMsgIsShow = true;
        this.scrollIntoView = "";
        this.scrollTop = 0;
        currentScrollTop = 0;
        const showLast = () => {
        };
        if (this.visibleMsgList.length === 0) {
          yield this.loadMore(showLast);
        } else {
          setTimeout(() => __async(this, null, function* () {
            const msgIsOverFlow = yield this.msgIsOverFlow();
            if (this.visibleMsgList.length === 0 || !msgIsOverFlow) {
              yield this.loadMore(showLast);
            }
          }), 0);
        }
      });
    },
    msgIsOverFlow() {
      return __async(this, null, function* () {
        if (this.visibleMsgList.length > 0) {
          let firstMsgTop = (yield this.getElInfo("#item-0")).top;
          let lastMsgBottom = (yield this.getElInfo("#item-" + (this.visibleMsgList.length - 1))).bottom;
          const listElInfo = yield this.getElInfo(".uni-im-list");
          return firstMsgTop < listElInfo.top || lastMsgBottom > listElInfo.bottom;
        } else {
          return true;
        }
      });
    },
    loadMore(callback) {
      return __async(this, null, function* () {
        let datas = [];
        datas = yield this.conversation.msg.getMore();
        if (datas.length) {
          yield this.insertMsg(datas);
        }
        if (typeof callback === "function") {
          setTimeout(() => {
            callback(datas);
          }, 0);
        }
        return datas;
      });
    },
    msgOnAppear(msgId) {
      uni_modules_uniIm_sdk_index.uniIm.utils.throttle(() => {
        let index = this.visibleMsgList.findIndex((i) => i._id == msgId);
        if (index == -1) {
          return;
        }
      }, 1e3);
    },
    setIntersectionObserver() {
      return __async(this, null, function* () {
        if (this.intersectionObserver) {
          this.intersectionObserver.disconnect();
          yield uni_modules_uniIm_sdk_index.uniIm.utils.sleep(1e3);
        }
        this.intersectionObserver = common_vendor.index.createIntersectionObserver(this, { observeAll: true }).relativeTo(".uni-im-list", {}).observe(".uni-im-msg", (res) => {
          var _a, _b;
          const msgId = res.id;
          const msgRef = this.$refs["uni-im-msg"].find((item) => item.msg._id == msgId);
          if (!msgRef) {
            return;
          }
          const hasBeenDisplayed = appearObj[msgId] || false;
          const isAppear = res.intersectionRatio > 0 && !hasBeenDisplayed;
          const isLastMsg = ((_a = [...this.visibleMsgList].pop()) == null ? void 0 : _a._id) === msgId;
          if (isLastMsg) {
            this.lastMsgIsShow = isAppear;
            if (this.lastMsgIsShow) {
              this.hasNewMsg = false;
            }
          }
          if (isAppear) {
            appearObj[msgId] = true;
            msgRef.onAppear();
            this.msgOnAppear(msgId);
            const isFirstMsg = ((_b = this.visibleMsgList[0]) == null ? void 0 : _b._id) === msgId;
            if (isFirstMsg) {
              this.loadMore();
            }
            uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("msg-appear", msgRef.msg);
          } else if (!res.intersectionRatio > 0 && hasBeenDisplayed) {
            appearObj[msgId] = false;
            msgRef.onDisappear();
            uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("msg-disappear", msgRef.msg);
          }
        });
      });
    },
    viewMsg(msgList) {
      this.$refs["view-msg"].open(msgList);
    },
    onScroll(e) {
      return __async(this, null, function* () {
        currentScrollTop = e.detail.scrollTop;
        this.onScroll.end = false;
        if (this.onScroll.timeoutId) {
          clearTimeout(this.onScroll.timeoutId);
        }
        this.onScroll.timeoutId = setTimeout(() => {
          this.onScroll.end = true;
        }, 500);
      });
    },
    onScrollToLower() {
      return __async(this, null, function* () {
      });
    },
    canHoldScrollDo(fn) {
      return __async(this, null, function* () {
        fn();
      });
    },
    insertMsg(data) {
      return __async(this, null, function* () {
        return yield new Promise((resolve) => {
          this.canHoldScrollDo(() => __async(this, null, function* () {
            const conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(data[0].conversation_id);
            conversation.msg.add(data, { unshift: true });
            resolve();
          }));
        });
      });
    },
    equalPrevTime(index) {
      if (index === 0) {
        return false;
      } else if (index == this.visibleMsgList.length - 1) {
        return false;
      } else {
        const getFriendlyTime = (msg) => {
          return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(msg.create_time || msg.client_create_time);
        };
        return getFriendlyTime(this.visibleMsgList[index]) == getFriendlyTime(this.visibleMsgList[index - 1]);
      }
    },
    showRemindMsg() {
      return __async(this, null, function* () {
        const msgId = this.conversation.readRemindMsg();
        common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.vue:400", "msgId", msgId);
        if (msgId) {
          this.showMsgById(msgId);
        }
      });
    },
    showLast() {
      let mLength = this.visibleMsgList.length;
      this.showMsgByIndex(mLength - 1);
      this.hasNewMsg = false;
    },
    notifyNewMsg() {
      this.hasNewMsg = true;
      if (this.lastMsgIsShow) {
        this.showLast();
      }
    },
    getElInfo(select) {
      return __async(this, null, function* () {
        return yield new Promise((resolve, rejece) => {
          const query = common_vendor.index.createSelectorQuery().in(this);
          query.select(select).boundingClientRect((data) => {
            if (!data) {
              common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.vue:422", "找不到 showMsgByIndex：" + select);
              return rejece(false);
            }
            resolve(data);
          }).exec();
        });
      });
    },
    showMsgByIndex(index) {
      return __async(this, null, function* () {
        if (index == -1) {
          return;
        }
        const listHeight = (yield this.getElInfo(".uni-im-list")).height;
        const targetInfo = yield this.getElInfo("#item-" + index);
        const itemScrollTop = targetInfo.top;
        let val = 0;
        let m = listHeight - targetInfo.height;
        if (m < 0) {
          m = 10;
        }
        if (this.isWidescreen) {
          val = itemScrollTop + currentScrollTop - 0.5 * m;
        } else {
          val = itemScrollTop * -1 + currentScrollTop + 0.3 * m;
        }
        this.scrollTop = currentScrollTop;
        this.$nextTick(() => __async(this, null, function* () {
          this.scrollTop = val;
        }));
      });
    },
    // 进入话题
    intoTopic(msgId) {
      let currentMsg = this.conversation.msg.find(msgId);
      const getAboutUser = (msg) => {
        const aboutUid = [msg.from_uid];
        const about_msg_id = msg.about_msg_id;
        if (!about_msg_id) {
          return aboutUid;
        }
        const aboutMsg = this.conversation.msg.find(about_msg_id);
        if (aboutMsg) {
          aboutUid.push(...getAboutUser(aboutMsg));
        }
        return [...new Set(aboutUid)];
      };
      this.filterAsUid = getAboutUser(currentMsg);
    },
    showMenberList() {
      this.$emit("showMenberList", arguments[0]);
    },
    showMsgById(msgId) {
      return __async(this, null, function* () {
        if (this.filterAsUid.length > 0) {
          return common_vendor.index.showToast({
            title: "话题中的消息，不支持定位到引用消息",
            icon: "none"
          });
        }
        let index = this.visibleMsgList.findIndex((i) => i._id == msgId);
        if (index === -1) {
          const { _findIndex } = this.showMsgById;
          if (!_findIndex) {
            common_vendor.index.showLoading();
            this.showMsgById._findIndex = 0;
          } else if (_findIndex > 29) {
            common_vendor.index.hideLoading();
            this.showMsgById._findIndex = false;
            common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.vue:500", "防止特殊情况下死循环，不加载30屏以外的引用数据");
            return common_vendor.index.showToast({
              title: "暂不支持，定向10屏以外的引用消息",
              icon: "none"
            });
          }
          this.showMsgById._findIndex++;
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.vue:507", "this.showMsgById._findIndex", this.showMsgById._findIndex);
          yield this.loadMore();
          return yield this.showMsgById(msgId);
        }
        yield uni_modules_uniIm_sdk_index.uniIm.utils.sleep(0);
        common_vendor.index.hideLoading();
        this.activeMsgId = msgId;
        if (this.showMsgActiveColorActionT) {
          clearTimeout(this.showMsgActiveColorActionT);
        }
        this.showMsgActiveColorActionT = setTimeout(() => {
          this.activeMsgId = "";
        }, 2e3);
        this.showMsgByIndex(index);
      });
    },
    isChecked(msg) {
      return this.checkedMsgList.some((i) => i._id === msg._id);
    },
    checkMsg(msg) {
      if (!this.chooseMore) {
        return;
      }
      let checkedMsgList = this.checkedMsgList;
      if (this.isChecked(msg)) {
        checkedMsgList.splice(checkedMsgList.findIndex((i) => i._id === msg._id), 1);
      } else {
        checkedMsgList.push(msg);
      }
      this.$emit("update:checkedMsgList", checkedMsgList);
    },
    showControl(e) {
      if (this.isWidescreen || this.onScroll.end !== false) {
        this.$emit("showControl", e);
      }
    },
    longpressMsgAvatar(e) {
      this.$emit("longpressMsgAvatar", e);
    },
    retriesSendMsg(msg) {
      if (msg.state === 0) {
        return common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.vue:550", "消息发送中");
      }
      this.$emit("retriesSendMsg", msg);
    },
    clickItem() {
      this.$emit("clickItem");
    },
    putChatInputContent(msgBody) {
      this.$emit("putChatInputContent", msgBody);
    },
    updateFilterUids(uids) {
      this.filterAsUid = uids;
    }
  }
};
if (!Array) {
  const _component_filter_contorl = common_vendor.resolveComponent("filter-contorl");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_uni_im_msg2 = common_vendor.resolveComponent("uni-im-msg");
  const _component_uni_im_list = common_vendor.resolveComponent("uni-im-list");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_group_notification2 = common_vendor.resolveComponent("uni-im-group-notification");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_im_group_notice_popup2 = common_vendor.resolveComponent("uni-im-group-notice-popup");
  const _easycom_uni_im_view_msg2 = common_vendor.resolveComponent("uni-im-view-msg");
  (_component_filter_contorl + _easycom_uni_im_load_state2 + _easycom_uni_im_msg2 + _component_uni_im_list + _easycom_uni_icons2 + _easycom_uni_im_group_notification2 + _easycom_uni_popup2 + _easycom_uni_im_group_notice_popup2 + _easycom_uni_im_view_msg2)();
}
const _easycom_uni_im_load_state = () => "../uni-im-load-state/uni-im-load-state.js";
const _easycom_uni_im_msg = () => "../uni-im-msg/uni-im-msg.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_group_notification = () => "../uni-im-group-notification/uni-im-group-notification.js";
const _easycom_uni_popup = () => "../../../uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_im_group_notice_popup = () => "../uni-im-group-notice-popup/uni-im-group-notice-popup.js";
const _easycom_uni_im_view_msg = () => "../uni-im-view-msg/uni-im-view-msg.js";
if (!Math) {
  (_easycom_uni_im_load_state + _easycom_uni_im_msg + _easycom_uni_icons + _easycom_uni_im_group_notification + _easycom_uni_popup + _easycom_uni_im_group_notice_popup + _easycom_uni_im_view_msg)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.sr("filter-contorl", "5e99c3c0-0"),
    b: common_vendor.o($options.updateFilterUids),
    c: common_vendor.p({
      conversationId: $props.conversationId
    }),
    d: common_vendor.f($options.visibleMsgList, (msg, index, i0) => {
      return common_vendor.e({
        a: index === 0
      }, index === 0 ? {
        b: "5e99c3c0-2-" + i0 + ",5e99c3c0-1",
        c: common_vendor.p({
          status: $options.loadStatus,
          contentText: {
            "contentrefresh": "正在加载历史消息",
            "contentnomore": "没有更多历史消息"
          }
        })
      } : {}, {
        d: $props.chooseMore && !msg.is_revoke
      }, $props.chooseMore && !msg.is_revoke ? {
        e: $props.checkedMsgList.find((i) => i._id == msg._id) != void 0
      } : {}, {
        f: common_vendor.sr("uni-im-msg", "5e99c3c0-3-" + i0 + ",5e99c3c0-1", {
          "f": 1
        }),
        g: msg._id,
        h: common_vendor.o($options.putChatInputContent, msg.unique_id || msg._id),
        i: common_vendor.o($options.showMsgById, msg.unique_id || msg._id),
        j: common_vendor.o($options.showControl, msg.unique_id || msg._id),
        k: common_vendor.o($options.intoTopic, msg.unique_id || msg._id),
        l: common_vendor.o($options.longpressMsgAvatar, msg.unique_id || msg._id),
        m: common_vendor.o($options.retriesSendMsg, msg.unique_id || msg._id),
        n: common_vendor.o($options.viewMsg, msg.unique_id || msg._id),
        o: "5e99c3c0-3-" + i0 + ",5e99c3c0-1",
        p: common_vendor.p({
          msg,
          id: msg._id,
          self: $options.currentUid == msg.from_uid,
          index,
          equalPrevTime: $options.equalPrevTime(index)
        }),
        q: msg._id === $data.activeMsgId || msg.unique_id === $data.activeMsgId ? 1 : "",
        r: common_vendor.o(($event) => $options.checkMsg(msg), msg.unique_id || msg._id),
        s: common_vendor.n(msg.type),
        t: "item-" + index,
        v: common_vendor.o((...args) => $options.clickItem && $options.clickItem(...args), msg.unique_id || msg._id),
        w: "item-" + index,
        x: msg.unique_id || msg._id
      });
    }),
    e: $props.chooseMore ? 1 : "",
    f: $options.visibleMsgList.length === 0
  }, $options.visibleMsgList.length === 0 ? {
    g: common_vendor.p({
      status: $options.loadStatus,
      contentText: {
        "contentrefresh": "加载中",
        "contentnomore": "- 没有聊天记录 -"
      }
    })
  } : {}, {
    h: common_vendor.sr("uni-im-list", "5e99c3c0-1"),
    i: common_vendor.o($options.onScroll),
    j: common_vendor.o($options.onScrollToLower),
    k: common_vendor.p({
      scrollTop: $data.scrollTop,
      ["scroll-into-view"]: $data.scrollIntoView
    }),
    l: $data.hasNewMsg
  }, $data.hasNewMsg ? {
    m: common_vendor.p({
      type: "pulldown",
      size: "18",
      color: "#007fff"
    }),
    n: common_vendor.o((...args) => $options.showLast && $options.showLast(...args))
  } : {}, {
    o: $data.remind_msg_ids.length
  }, $data.remind_msg_ids.length ? {
    p: common_vendor.t($data.remind_msg_ids.length),
    q: common_vendor.o((...args) => $options.showRemindMsg && $options.showRemindMsg(...args))
  } : {}, {
    r: common_vendor.sr("group-notification", "5e99c3c0-7,5e99c3c0-6"),
    s: common_vendor.sr("group-notification-popup", "5e99c3c0-6"),
    t: common_vendor.o(($event) => $event.show ? "" : _ctx.closeGroupNotification()),
    v: common_vendor.p({
      type: "center"
    }),
    w: common_vendor.sr("uni-im-group-notice-popup", "5e99c3c0-8"),
    x: common_vendor.sr("view-msg", "5e99c3c0-9"),
    y: $data.filterAsUid.length ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg-list/uni-im-msg-list.js.map
