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
const db = common_vendor.tr.database();
const _sfc_main = {
  emits: ["clickMenu"],
  props: {
    // pc端时会控制隐藏
    showMenu: {
      type: Boolean,
      default: true
    },
    // pc端时会控制隐藏
    showUser: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isOpenItemTitle: "",
      scrollLeft: {
        0: 0,
        1: 1
      },
      activeIndex: false,
      menuList: [
        {
          title: "加人/加群",
          path: "./addPeopleGroups/addPeopleGroups",
          srcName: "search"
        },
        {
          title: "群聊列表",
          path: "./groupList/groupList",
          srcName: "group"
        },
        {
          title: "创建群聊",
          path: "./createGroup/createGroup",
          srcName: "createGroup"
        }
      ]
    };
  },
  computed: {
    //是否为pc宽屏（width>960px）
    isWidescreen() {
      return uni_modules_uniIm_sdk_index.uniIm.isWidescreen;
    },
    friendList() {
      return uni_modules_uniIm_sdk_index.uniIm.friend.dataList;
    },
    friendHasMore() {
      return uni_modules_uniIm_sdk_index.uniIm.friend.hasMore;
    },
    noticeList() {
      return [
        {
          title: "新朋友",
          param: {
            type: ["uni-im-friend-invite"]
          },
          icon: "/uni_modules/uni-im/static/noticeIcon/newFriend.png"
        },
        {
          title: "群通知",
          param: {
            type: ["uni-im-group-join-request"]
          },
          icon: "/uni_modules/uni-im/static/noticeIcon/groupNotice.png"
        },
        {
          title: "系统通知",
          param: {
            excludeType: ["uni-im-group-join-request", "uni-im-friend-invite"]
          },
          icon: "/uni_modules/uni-im/static/noticeIcon/notification.png"
        }
      ].reduce((sum, item, index) => {
        let {
          param: filterNotice,
          title
        } = item, param = {
          filterNotice,
          title
        };
        sum.push({
          title: item.title,
          badge: this.getUnreadCount(item.param),
          badgeStyle: {
            backgroundColor: "#d60000"
          },
          path: "./notification/notification?param=" + encodeURIComponent(JSON.stringify(param)),
          param,
          icon: item.icon,
          id: Date.now() + "-" + index
        });
        return sum;
      }, []);
    }
  },
  onPullDownRefresh() {
    this.$refs.udb.loadData({
      clear: true
    }, () => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
  },
  mounted() {
  },
  methods: {
    openPages(item) {
      this.isOpenItemTitle = item.title;
      common_vendor.index.navigateTo({
        url: item.path,
        fail: (e) => {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/contacts/contacts.vue:182", e, item.path);
        }
      });
    },
    getUnreadCount(param) {
      return uni_modules_uniIm_sdk_index.uniIm.notification.unreadCount(param);
    },
    toChat(item) {
      uni_modules_uniIm_sdk_index.uniIm.toChat({ user_id: item._id });
    },
    hiddenDeleteBtn() {
      this.activeIndex = false;
      this.$nextTick(() => {
        for (let i in this.scrollLeft) {
          this.$set(this.scrollLeft, i, 0);
        }
      });
    },
    deleteItem(item, index, event) {
      return __async(this, null, function* () {
        common_vendor.index.showModal({
          title: "确认要删除好友吗",
          content: "此操作不可撤销",
          showCancel: true,
          cancelText: "取消",
          confirmText: "确认",
          complete: (e) => __async(this, null, function* () {
            if (e.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              yield db.collection("uni-im-friend").where({
                friend_uid: item._id,
                user_id: uni_modules_uniIm_sdk_index.uniIm.currentUser._id
              }).remove();
              common_vendor.index.hideLoading();
            }
          })
        });
        this.hiddenDeleteBtn();
        event.stopPropagation();
        event.preventDefault();
      });
    },
    scroll(e) {
      this.$set(this.scrollLeft, this.activeIndex, e.detail.scrollLeft);
      for (let i in this.scrollLeft) {
        if (i != this.activeIndex) {
          this.$set(this.scrollLeft, i, 0);
        }
      }
    },
    handleItemClick(id) {
      common_vendor.index.navigateTo({
        url: "./detail?id=" + id
      });
    },
    fabClick() {
      common_vendor.index.navigateTo({
        url: "./add",
        events: {
          // 监听新增数据成功后, 刷新当前页面数据
          refreshData: () => {
            this.$refs.udb.loadData({
              clear: true
            });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  (_easycom_uni_list_item2 + _easycom_uni_list2 + _easycom_uni_im_load_state2)();
}
const _easycom_uni_list_item = () => "../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../uni-list/components/uni-list/uni-list.js";
const _easycom_uni_im_load_state = () => "../../components/uni-im-load-state/uni-im-load-state.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list + _easycom_uni_im_load_state)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showMenu
  }, $props.showMenu ? {
    b: common_vendor.f($data.menuList, (menu, menuIndex, i0) => {
      return {
        a: "/uni_modules/uni-im/static/noticeIcon/" + menu.srcName + ".png",
        b: menuIndex,
        c: common_vendor.o(($event) => $options.openPages(menu), menuIndex),
        d: $data.isOpenItemTitle === menu.title ? 1 : "",
        e: "3ed114b8-1-" + i0 + ",3ed114b8-0",
        f: common_vendor.p({
          title: menu.title,
          link: true,
          showBadge: true
        })
      };
    }),
    c: common_vendor.f($options.noticeList, (item, index, i0) => {
      return {
        a: item.icon,
        b: item.id,
        c: common_vendor.o(($event) => $options.openPages(item), item.id),
        d: $data.isOpenItemTitle === item.title ? 1 : "",
        e: "3ed114b8-2-" + i0 + ",3ed114b8-0",
        f: common_vendor.p({
          title: item.title,
          showBadge: true,
          badgeText: item.badge,
          badgeStyle: item.badgeStyle,
          link: true,
          border: false
        })
      };
    }),
    d: common_vendor.p({
      border: false
    })
  } : {}, {
    e: $props.showUser
  }, $props.showUser ? {
    f: common_vendor.f($options.friendList, (item, index, i0) => {
      return {
        a: item.avatar_file && item.avatar_file.url ? item.avatar_file.url : "/uni_modules/uni-im/static/avatarUrl.png",
        b: common_vendor.t(item.nickname),
        c: common_vendor.o(($event) => $options.deleteItem(item, index, $event), item._id),
        d: common_vendor.o(($event) => $options.toChat(item), item._id),
        e: common_vendor.o(($event) => $data.activeIndex = index, item._id),
        f: common_vendor.o((...args) => $options.scroll && $options.scroll(...args), item._id),
        g: $data.activeIndex === index ? "" : $data.scrollLeft[index],
        h: item._id,
        i: "3ed114b8-4-" + i0 + ",3ed114b8-3"
      };
    }),
    g: common_vendor.p({
      customStyle: {
        padding: 0
      }
    }),
    h: common_vendor.p({
      status: $options.friendHasMore ? "loading" : "noMore"
    }),
    i: common_vendor.p({
      customStyle: {
        padding: 0,
        backgroundColor: "#FFFFFF"
      }
    }),
    j: common_vendor.p({
      border: false,
      ["scroll-y"]: true
    })
  } : {}, {
    k: common_vendor.o((...args) => $options.hiddenDeleteBtn && $options.hiddenDeleteBtn(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/contacts.js.map
