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
const db = common_vendor.tr.database();
const _sfc_main = {
  components: {},
  data() {
    return {
      conversation: {
        group: {
          user_id: "",
          mute_all_members: false,
          member: {
            dataList: []
          }
        },
        mute: false
      },
      leave_group: false,
      editorType: "",
      editorDefaultValue: "",
      groupType: "",
      isAdmin: false,
      keyword: "",
      mute_all_members: false,
      // 鼠标在哪个用户id上
      hoverUserId: "",
      // 延迟渲染，避免页面卡顿
      laterRenderIndex: 0,
      showLoadMoreBtn: true
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    member() {
      return this.conversation.group.member;
    },
    memberList() {
      let memberList = this.member.dataList.filter((member) => {
        return member.users.nickname.toLowerCase().includes(this.keyword.toLowerCase());
      }).sort((a, b) => {
        if (a.role.includes("admin") && !b.role.includes("admin")) {
          return -1;
        } else if (!a.role.includes("admin") && b.role.includes("admin")) {
          return 1;
        } else {
          return 0;
        }
      }).filter((item, index) => {
        return index < this.canRenderCount;
      });
      return memberList;
    },
    // 允许被渲染的个数
    canRenderCount() {
      let n = this.laterRenderIndex * 50 - (this.isAdmin ? 1 : 0);
      if (this.laterRenderIndex === 0) {
        n = this.isAdmin ? 9 : 10;
      }
      return n;
    },
    // 剩余未渲染的个数
    notRenderCount() {
      return this.member.dataList.length - this.canRenderCount;
    },
    // 是否全部显示（全部加载完毕，并全部被渲染）
    isAllShow() {
      return this.notRenderCount <= 0 && !this.member.hasMore;
    },
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    isGroupCreator() {
      return this.conversation.group.user_id == this.currentUid;
    },
    canPrivateChat() {
      var _a;
      return this.uniIDHasRole("staff") || ((_a = this.member.find(this.currentUid)) == null ? void 0 : _a.role.includes("admin")) || this.hoverUserId && this.member.find(this.hoverUserId).role.includes("admin");
    }
  }),
  onReachBottom() {
    this.showMore();
  },
  watch: {
    // （后续）通过监听实现实时切换管理员实时刷新权限
    // uni.__f__('log','at uni_modules/uni-im/pages/group/members.vue:148','isAdmin',isAdmin);
    conversation: {
      handler(conversation, oldValue) {
        var _a;
        this.isAdmin = this.isGroupCreator || ((_a = this.member.find(this.currentUid)) == null ? void 0 : _a.role.includes("admin"));
        this.leave_group = conversation.leave;
        this.mute_all_members = conversation.group.mute_all_members;
      },
      deep: true
    }
  },
  props: {
    conversation_id: {
      default() {
        return false;
      }
    }
  },
  onLoad(e) {
    return __async(this, null, function* () {
      if (!e.conversation_id) {
        throw new Error("会话id不能为空");
      }
      this.load(e.conversation_id);
      this.showLoadMoreBtn = false;
      this.laterRenderIndex = 1;
    });
  },
  mounted() {
    if (this.conversation_id) {
      this.load(this.conversation_id);
    }
  },
  methods: {
    load(conversation_id) {
      return __async(this, null, function* () {
        this.conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(conversation_id);
      });
    },
    toChat(user_id) {
      if (this.canPrivateChat) {
        uni_modules_uniIm_sdk_index.uniIm.toChat({
          user_id,
          source: {
            group_id: this.conversation.group_id
          }
        });
      }
    },
    showMore() {
      if (this.notRenderCount < 5) {
        this.member.loadMore().then(() => {
          this.laterRenderIndex++;
        });
      } else {
        this.laterRenderIndex++;
      }
    },
    lookMore() {
      if (this.isWidescreen) {
        if (this.isAllShow) {
          this.laterRenderIndex = 0;
        } else {
          this.showMore();
        }
      } else {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-im/pages/group/members?conversation_id=" + this.conversation.id,
          animationType: "slide-in-right"
        });
      }
    },
    invite() {
      const group_id = this.conversation.group._id;
      if (this.isWidescreen) {
        this.$refs.invitePagePopup.open();
        setTimeout(() => {
          this.$refs.invitePage.setParam({ group_id });
        }, 0);
      } else {
        common_vendor.index.navigateTo({
          url: "/uni_modules/uni-im/pages/contacts/createGroup/createGroup?group_id=" + group_id
        });
      }
    },
    expel(item) {
      return __async(this, null, function* () {
        common_vendor.index.showModal({
          title: "确定要将该用户移出本群吗？",
          content: "不能撤销，请谨慎操作",
          cancelText: "取消",
          confirmText: "确认",
          complete: (e) => __async(this, null, function* () {
            if (e.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              try {
                let res = yield db.collection("uni-im-group-member").where({
                  user_id: item.users._id,
                  group_id: this.conversation.group._id
                }).remove();
                if (res.result.deleted) {
                  common_vendor.index.showToast({
                    title: "成功移除",
                    icon: "none",
                    complete: () => {
                    }
                  });
                }
              } catch (error) {
                common_vendor.index.showToast({
                  title: error.message,
                  icon: "error",
                  complete: () => {
                  }
                });
              }
              common_vendor.index.hideLoading();
            }
          })
        });
      });
    },
    expelAndToBlack(item) {
      return __async(this, null, function* () {
        common_vendor.index.showModal({
          title: "确定要将该用户移出本群并拉黑吗？",
          content: "拉黑后此用户将不能再次加入本群，不能撤销，请谨慎操作",
          cancelText: "取消",
          confirmText: "确认",
          complete: (e) => __async(this, null, function* () {
            if (e.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              try {
                let res = yield db.collection("uni-im-group-member").where({
                  user_id: item.users._id,
                  group_id: this.conversation.group._id
                }).remove();
                common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/members.vue:287", "expel", res);
                const uniImCo = common_vendor.tr.importObject("uni-im-co");
                res = yield uniImCo.addToGroupMenberBlackList({
                  user_id: item.users._id,
                  group_id: this.conversation.group._id
                });
                common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/members.vue:293", "expelAndToBlack", res);
              } catch (error) {
                common_vendor.index.showToast({
                  title: error.message,
                  icon: "error",
                  complete: () => {
                  }
                });
              }
              common_vendor.index.hideLoading();
            }
          })
        });
      });
    },
    changeMemberMute(item) {
      return __async(this, null, function* () {
        let nickname = item.users.nickname || "匿名用户";
        common_vendor.index.showModal({
          title: "确定要" + (item.mute_type ? `为"${nickname}"解除禁言吗？` : `禁言"${nickname}"吗？`),
          cancelText: "取消",
          confirmText: "确认",
          complete: (e) => __async(this, null, function* () {
            if (e.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              try {
                let res = yield db.collection("uni-im-group-member").where({
                  _id: item._id,
                  mute_type: item.mute_type
                  // 防止此时云端已经变化
                }).update({
                  mute_type: item.mute_type ? 0 : 1
                });
                if (res.result.updated) {
                  item.mute_type = item.mute_type ? 0 : 1;
                  common_vendor.index.showToast({
                    title: "设置成功",
                    icon: "none",
                    complete: () => {
                    }
                  });
                }
              } catch (error) {
                common_vendor.index.showToast({
                  title: error.message,
                  icon: "error",
                  complete: () => {
                  }
                });
              }
              common_vendor.index.hideLoading();
            }
          })
        });
      });
    },
    openConversationMenu(event, index) {
      if (!this.isAdmin) {
        return;
      }
      const member = this.memberList[index];
      const menuList = [];
      menuList.unshift({
        "title": "移除",
        "action": () => {
          this.expel(member);
        }
      });
      menuList.unshift({
        "title": "移除并拉黑",
        "action": () => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/members.vue:366", "移除并拉黑");
          this.expelAndToBlack(member);
        }
      });
      if (!this.conversation.group.mute_all_members) {
        menuList.unshift({
          "title": member.mute_type ? "解除禁言" : "设为禁言",
          "action": () => {
            this.changeMemberMute(member);
          }
        });
      }
      const isAdmin = member.role.includes("admin");
      menuList.push({
        "title": isAdmin ? "取消管理员" : "设置管理员",
        "action": () => {
          let role = member.role;
          if (isAdmin) {
            role = member.role.filter((item) => item !== "admin");
          } else {
            role.push("admin");
          }
          common_vendor.index.showLoading({
            mask: true
          });
          db.collection("uni-im-group-member").doc(member._id).update({
            "role": role
          }).then((res) => {
            member.role = role;
          }).catch((err) => {
            common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/group/members.vue:403", err);
            common_vendor.index.showToast({
              title: err.message,
              icon: "none"
            });
          }).finally(() => {
            common_vendor.index.hideLoading();
          });
        }
      });
      if (menuList.length > 0) {
        member.focus = true;
        const myContextmenu = this.$refs["uni-im-contextmenu"];
        let position = {
          "top": event.touches[0].screenY || event.touches[0].clientY,
          "left": event.touches[0].screenX || event.touches[0].clientX
        };
        if (event.type === "contextmenu") {
          position = {
            "top": event.clientY,
            "left": event.clientX
          };
        }
        myContextmenu.show(position, menuList);
        myContextmenu.onClose(() => {
          member.focus = false;
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_contextmenu2 = common_vendor.resolveComponent("uni-im-contextmenu");
  (_easycom_uni_search_bar2 + _easycom_uni_icons2 + _easycom_uni_im_contextmenu2)();
}
const _easycom_uni_search_bar = () => "./uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_icons = () => "./uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_contextmenu = () => "./uni_modules/uni-im/components/uni-im-contextmenu/uni-im-contextmenu.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_icons + _easycom_uni_im_contextmenu)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $data.keyword = $event),
    b: common_vendor.p({
      radius: "5",
      placeholder: "输入昵称搜索",
      clearButton: "auto",
      cancelButton: "none",
      modelValue: $data.keyword
    }),
    c: !$data.leave_group
  }, !$data.leave_group ? common_vendor.e({
    d: $data.isAdmin
  }, $data.isAdmin ? {
    e: common_vendor.o($options.invite),
    f: common_vendor.p({
      color: "#989898",
      size: "20px",
      type: "plusempty"
    })
  } : {}, {
    g: common_vendor.f($options.memberList, (member, index, i0) => {
      return common_vendor.e({
        a: member.users.avatar_file && member.users.avatar_file.url ? member.users.avatar_file.url : "/uni_modules/uni-im/static/avatarUrl.png",
        b: common_vendor.t(member.users.nickname || "匿名用户"),
        c: member.role.includes("admin")
      }, member.role.includes("admin") ? {} : {}, {
        d: !$data.mute_all_members && member.mute_type
      }, !$data.mute_all_members && member.mute_type ? {} : {}, {
        e: member.users.nickname,
        f: member.focus ? 1 : "",
        g: common_vendor.o(($event) => $options.toChat(member.users._id), index),
        h: common_vendor.o(($event) => $options.openConversationMenu($event, index), index),
        i: common_vendor.o(($event) => $options.openConversationMenu($event, index), index),
        j: common_vendor.o(($event) => $data.hoverUserId = member.users._id, index),
        k: index
      });
    }),
    h: $options.canPrivateChat ? 1 : ""
  }) : {}, {
    i: $data.showLoadMoreBtn
  }, $data.showLoadMoreBtn ? common_vendor.e({
    j: $data.laterRenderIndex > 0
  }, $data.laterRenderIndex > 0 ? {
    k: common_vendor.o(($event) => $data.laterRenderIndex = 0)
  } : {}, {
    l: $options.member.loading
  }, $options.member.loading ? {} : !$options.isAllShow ? {
    n: common_vendor.o((...args) => $options.lookMore && $options.lookMore(...args))
  } : {}, {
    m: !$options.isAllShow
  }) : common_vendor.e({
    o: $options.member.loading
  }, $options.member.loading ? {} : !$options.member.hasMore ? {} : {}, {
    p: !$options.member.hasMore
  }), {
    q: common_vendor.sr("uni-im-contextmenu", "6969919c-2")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/members.js.map
