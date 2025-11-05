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
let lastConversationId = false;
const _sfc_main = {
  data() {
    return {
      extIndexMenu: uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("index-page-menu").map((i) => common_vendor.markRaw(i.component)),
      users: {},
      dynamicComponentName: "uni-im-addPeopleGroups",
      //通过动态组件引入页面在pc端显示
      view2Title: "加人/加群",
      contactsViewIsShow: false,
      chatInfoIsShow: false,
      currentConversation: {},
      keyword: "",
      conversationList: [],
      filteredConversationId: false
      // 仅显示匹配的聊天记录的会话
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["currentConversationId", "isWidescreen"])), {
    unreadMsgCount() {
      return uni_modules_uniIm_sdk_index.uniIm.conversation.unreadCount();
    },
    unreadnotificationCount() {
      return uni_modules_uniIm_sdk_index.uniIm.notification.unreadCount();
    },
    avatarUrl() {
      var _a, _b;
      return ((_b = (_a = uni_modules_uniIm_sdk_index.uniIm.currentUser) == null ? void 0 : _a.avatar_file) == null ? void 0 : _b.url) || "/uni_modules/uni-im/static/avatarUrl.png";
    }
  }),
  watch: {
    unreadMsgCount: {
      handler(unreadMsgCount) {
        uni_modules_uniIm_sdk_index.uniIm.utils.setTabBarBadge(0, unreadMsgCount);
        uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("ui-update-unread-count", unreadMsgCount);
      },
      immediate: true
    },
    contactsViewIsShow(contactsViewIsShow) {
      if (contactsViewIsShow) {
        lastConversationId = this.currentConversationId;
        uni_modules_uniIm_sdk_index.uniIm.currentConversationId = false;
      } else {
        if (lastConversationId) {
          uni_modules_uniIm_sdk_index.uniIm.currentConversationId = lastConversationId;
          this.$nextTick(() => {
            this.toChat(lastConversationId);
          });
        }
      }
    },
    //  根据当前会话id，设置会话对象
    currentConversationId(id) {
      return __async(this, null, function* () {
        if (id) {
          this.currentConversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(id);
          if (this.currentConversation.hidden) {
            this.currentConversation.hidden = false;
          }
        }
      });
    }
  },
  onLoad(param) {
    return __async(this, null, function* () {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:213", "onLoad", param);
      yield Promise.all(uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("index-load-before-extra", param));
      const { tokenExpired } = uni_modules_uniIm_sdk_index.uniIm.currentUser;
      if (tokenExpired < Date.now()) {
        common_vendor.index.__f__("info", "at uni_modules/uni-im/pages/index/index.vue:221", "当前用户的登录状态无效，将自动跳转至登录页面。", param);
        let url = "/uni_modules/uni-id-pages/pages/login/login-withpwd?uniIdRedirectUrl=";
        let paramString = "/uni_modules/uni-im/pages/index/index?";
        for (let key in param) {
          paramString += `${key}=${param[key]}&`;
        }
        paramString = paramString.substring(0, paramString.length - 1);
        url += encodeURIComponent(paramString);
        return common_vendor.index.redirectTo({
          url
        });
      }
      uni_modules_uniIm_sdk_index.uniIm.onInitDataAfter(() => {
        this.init(param);
      });
    });
  },
  onShow() {
  },
  onReady() {
    return __async(this, null, function* () {
      common_vendor.index.$on("uni-im-toChat", (param) => {
        if (param) {
          lastConversationId = false;
          this.toChat(param);
        }
        this.contactsViewIsShow = false;
      });
    });
  },
  onUnload() {
  },
  onBackPress(e) {
    const clRef = this.$refs["uni-im-conversation-list"];
    if (clRef.focusConversationId) {
      clRef.closeConversationMenu();
      return true;
    }
  },
  onHide() {
  },
  methods: {
    fragmentClosed() {
      if (lastConversationId) {
        uni_modules_uniIm_sdk_index.uniIm.currentConversationId = lastConversationId;
        this.$nextTick(() => {
          this.toChat(lastConversationId);
        });
      }
    },
    clickMenu(data) {
      this.dynamicComponentName = data.componentName;
      if (data.title) {
        this.view2Title = data.title;
      }
      this.$nextTick(() => {
        this.$refs.dynamicComponent.setParam(data.param || {});
        if (data.componentName == "uni-im-createGroup") {
          this.$refs.dynamicComponent.getFriendsData();
        }
      });
    },
    /**
     * @description 根据群id，申请加入群聊
     * @param {Object} 群id
     */
    joinGroup(group_id) {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:405", "group_id", group_id);
      const db = common_vendor.tr.database();
      common_vendor.index.showLoading({
        title: "正在申请加群...",
        mask: true
      });
      db.collection("uni-im-group-join").add({
        group_id,
        "message": ""
      }).then((res) => {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:415", "res: ", res);
        if (res.result.isPass) {
          this.toChat("group_" + group_id);
        } else {
          common_vendor.index.showToast({
            icon: "none",
            title: "已提交加群申请，等待管理员审核"
          });
        }
      }).catch((err) => {
        if (err.code === 10001) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:426", "已经是群成员 直接打开对应页面");
          return this.toChat("group_" + group_id);
        }
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    readQrCode() {
      common_vendor.index.scanCode({
        complete: (e) => {
          try {
            let data = JSON.parse(e.result);
            if (data.type == "uni-im" && data.subType == "groupInfo") {
            }
          } catch (e2) {
          }
        }
      });
    },
    init(_0) {
      return __async(this, arguments, function* ({
        conversation_id,
        goods,
        user_id,
        joinGroup
      }) {
        if (user_id || conversation_id) {
          this.toChat(conversation_id || { user_id });
        }
        setTimeout(() => this.currentConversation.customIndex = Date.now(), 0);
        if (this.conversationList.length < 30) {
          yield this.$nextTick();
          yield this.$refs["uni-im-conversation-list"].loadMore();
        } else {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:482", "会话列表已满一页，需要用户自己滚动到底，再拉取更多");
        }
        if (this.isWidescreen && goods) {
          if (typeof goods != "object") {
            goods = JSON.parse(goods);
          }
          const {
            name,
            url
          } = goods;
          if (name && url) {
            setTimeout(() => {
              this.$refs["chat-view"].chatInputContent = "【" + name + ":" + url + "】";
            }, 1e3);
          }
        }
        if (joinGroup) {
          this.joinGroup(joinGroup);
        }
      });
    },
    search(e) {
      common_vendor.index.showToast({
        title: "加好友功能入口，暂时在左侧菜单的通讯录中",
        icon: "none",
        duration: 3e3
      });
    },
    addUser() {
      common_vendor.index.showToast({
        title: "加好友功能入口，暂时在左侧菜单的通讯录中",
        icon: "none",
        duration: 3e3
      });
    },
    showChatView() {
      this.contactsViewIsShow = false;
      const ucId = uni_modules_uniIm_sdk_index.uniIm.conversation.dataList.filter((item) => item.unread_count > 0).filter((item) => !item.mute).map((item) => item.id);
      if (ucId.length > 0) {
        let index = ucId.findIndex((item) => item == this.currentConversation.id);
        index >= 0 ? index++ : index = 0;
        this.toChat(ucId[index]);
      }
    },
    showContactsView() {
      this.contactsViewIsShow = true;
      if (!this.showContactsView.firstOpen) {
        this.showContactsView.firstOpen = true;
        this.$nextTick(() => {
          const contactsRef = this.$refs["uni-im-contacts"];
          contactsRef.openPages(contactsRef.menuList[0]);
        });
      }
    },
    closeChatFiltered() {
      var _a;
      if (this.isWidescreen) {
        (_a = this.$refs["chat-filtered"]) == null ? void 0 : _a.onCloseFragment();
      }
    },
    toChatFiltered({ conversation_id, count, keyword, msg }) {
      this.chatInfoIsShow = false;
      this.filteredConversationId = conversation_id;
      lastConversationId = this.currentConversationId;
      uni_modules_uniIm_sdk_index.uniIm.currentConversationId = false;
      if (this.isWidescreen) {
        this.$nextTick(() => {
          let chatFilteredRef = this.$refs["chat-filtered"];
          if (chatFilteredRef) {
            chatFilteredRef.load({
              conversation_id,
              keyword,
              count,
              msg
            });
          }
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/uni_modules/uni-im/pages/chat/chat-filtered?conversation_id=${conversation_id}&keyword=${encodeURIComponent(keyword)}&count=${count}`,
          animationDuration: 300
        });
      }
    },
    toChat(param) {
      return __async(this, null, function* () {
        this.chatInfoIsShow = false;
        this.keyword = "";
        this.filteredConversationId = false;
        const { id } = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(param);
        uni_modules_uniIm_sdk_index.uniIm.currentConversationId = id;
        if (this.isWidescreen) {
          this.$nextTick(() => {
            let chatViewRef = this.$refs["chat-view"];
            if (chatViewRef) {
              chatViewRef.load(id);
            }
          });
        } else {
          common_vendor.index.navigateTo({
            url: "/uni_modules/uni-im/pages/chat/chat?conversation_id=" + id,
            animationDuration: 300
          });
        }
      });
    },
    showChatInfo() {
      this.chatInfoIsShow = !this.chatInfoIsShow;
      if (this.chatInfoIsShow) {
        this.$nextTick(() => {
          if (this.currentConversation.group_id) {
            this.$refs["group-info"].load(this.currentConversation.id);
          } else {
            this.$refs["chat-info"].load(this.currentConversation);
          }
        });
      }
    },
    toUcenter() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true",
        complete(e) {
        }
      });
    },
    openConversationMenu(e, name) {
      const myContextmenu = this.$refs["uni-im-contextmenu"];
      let menuList = [];
      if (name == "unreadMsgCount" && this.unreadMsgCount > 0) {
        menuList.push({
          "title": "清空所有未读消息数",
          "action": () => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:632", "清空所有未读消息数");
            uni_modules_uniIm_sdk_index.uniIm.conversation.clearUnreadCount();
          }
        });
      }
      if (menuList.length == 0) {
        return;
      }
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/index/index.vue:640", "menuList.length", menuList.length);
      myContextmenu.show({
        "top": e.clientY + 35,
        "left": e.clientX
      }, menuList);
    }
  },
  onReachBottom() {
    return __async(this, null, function* () {
      var _a;
      yield (_a = this.$refs["uni-im-conversation-list"]) == null ? void 0 : _a.loadMore();
    });
  },
  onNavigationBarButtonTap() {
    common_vendor.index.navigateTo({
      url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true",
      complete: (e) => {
      }
    });
  }
};
if (!Array) {
  const _easycom_uni_im_conversation_list2 = common_vendor.resolveComponent("uni-im-conversation-list");
  _easycom_uni_im_conversation_list2();
}
const _easycom_uni_im_conversation_list = () => "../../components/uni-im-conversation-list/uni-im-conversation-list.js";
if (!Math) {
  _easycom_uni_im_conversation_list();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.sr("uni-im-conversation-list", "4f527584-0"),
    b: !$data.keyword,
    c: common_vendor.o(($event) => $options.toChat($event.id)),
    d: common_vendor.o(($event) => $data.conversationList = $event),
    e: common_vendor.p({
      ["active-conversation-id"]: _ctx.currentConversationId,
      id: "conversation-list-box"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/index/index.js.map
