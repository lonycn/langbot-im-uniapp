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
const members = () => "./members2.js";
const _sfc_main = {
  components: {
    "uni-im-group-members": members
  },
  data() {
    return {
      conversation: {
        group: {
          user_id: "",
          mute_all_members: false,
          member: {
            dataList: [],
            count: () => 0
          }
        },
        mute: false
      },
      leave_group: false,
      editorFields: {
        "name": " 群聊名称",
        "introduction": "群简介"
      },
      editorType: "",
      editorDefaultValue: "",
      groupType: "",
      isAdmin: false,
      keyword: "",
      mute_all_members: false,
      showAllMember: false,
      conversation_id: "",
      // 鼠标在哪个用户id上
      hoverUserId: ""
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])), {
    currentUid() {
      return uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    logoUrl() {
      return this.conversation.group.avatar_file ? this.conversation.group.avatar_file.url : false;
    },
    join_option() {
      let val = this.conversation.group.join_option;
      return {
        needPermission: "需要验证权限",
        freeAccess: "自由加入",
        disableApply: "禁止加入"
      }[val];
    },
    isGroupCreator() {
      return this.conversation.group.user_id == this.currentUid;
    },
    canPrivateChat() {
      return this.uniIDHasRole("staff") || this.hoverUserId && this.conversation.group.member.find(this.hoverUserId).role.includes("admin");
    },
    isTmpGroup() {
      var _a, _b;
      return ((_b = (_a = this.conversation) == null ? void 0 : _a.id) == null ? void 0 : _b.indexOf("__tmp")) === 0;
    },
    isBissnessGroup() {
      var _a, _b;
      return (_b = (_a = this.conversation.group) == null ? void 0 : _a.ext) == null ? void 0 : _b.business_group_code;
    }
  }),
  watch: {
    "conversation.group.member_count"() {
      this.updateNavTitle();
    },
    // （后续）通过监听实现实时切换管理员实时刷新权限
    // uni.__f__('log','at uni_modules/uni-im/pages/group/info.vue:142','isAdmin',isAdmin);
    conversation: {
      handler(conversation, oldValue) {
        var _a;
        this.isAdmin = this.isGroupCreator || ((_a = this.conversation.group.member.find(this.currentUid)) == null ? void 0 : _a.role.includes("admin"));
        this.leave_group = conversation.leave;
        this.mute_all_members = conversation.group.mute_all_members;
      },
      deep: true
    }
  },
  onLoad(e) {
    return __async(this, null, function* () {
      if (!e.conversation_id) {
        throw new Error("会话id不能为空");
      }
      this.load(e.conversation_id);
    });
  },
  onShow() {
    this.updateNavTitle();
  },
  methods: {
    updateNavTitle() {
      const { group: { member_count }, title } = this.conversation;
      if (!uni_modules_uniIm_sdk_index.uniIm.isWidescreen && typeof member_count == "number") {
        const newTitle = title + "（" + member_count + "人）-  群信息";
        common_vendor.index.setNavigationBarTitle({ "title": newTitle });
      }
    },
    navToMembers(conversation_id) {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-im/pages/group/members?conversation_id=" + conversation_id
      });
    },
    load(conversation_id) {
      return __async(this, null, function* () {
        this.conversation_id = conversation_id;
        this.conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get(conversation_id);
      });
    },
    exitGroup() {
      return __async(this, null, function* () {
        const group_id = this.conversation.group._id;
        if (this.isGroupCreator) {
          common_vendor.index.showModal({
            title: "确认要解散群聊吗？",
            content: "不能撤销，请谨慎操作",
            cancelText: "取消",
            confirmText: "确认",
            complete: (e) => __async(this, null, function* () {
              if (e.confirm) {
                common_vendor.index.showLoading({
                  mask: true
                });
                yield db.collection("uni-im-group").where({
                  _id: group_id
                }).remove().finally((res) => {
                  common_vendor.index.hideLoading();
                });
              }
            })
          });
        } else {
          common_vendor.index.showModal({
            title: "确认退出当前群聊？",
            content: `退出后聊天记录将会被清空，此操作无法撤销，请谨慎操作。`,
            cancelText: "取消",
            confirmText: "确认",
            complete: (e) => __async(this, null, function* () {
              if (e.confirm) {
                common_vendor.index.showLoading({
                  mask: true
                });
                let res = yield db.collection("uni-im-group-member").where({
                  user_id: this.currentUid,
                  group_id
                }).remove();
                if (res.result.deleted) {
                  common_vendor.index.showToast({
                    title: "成功退出",
                    icon: "none"
                  });
                  uni_modules_uniIm_sdk_index.uniIm.conversation.remove(this.conversation_id);
                }
                common_vendor.index.hideLoading();
              }
            })
          });
        }
      });
    },
    openPopupInfo(type) {
      var _a;
      if (!this.isAdmin)
        return;
      this.editorType = type;
      this.editorDefaultValue = this.conversation.group[type];
      if (this.editorType == "notification") {
        this.editorDefaultValue = ((_a = this.editorDefaultValue) == null ? void 0 : _a.content) || "";
      }
      this.$refs.popupInfo.open();
    },
    closePopupInfo() {
      this.$refs.popupInfo.close();
    },
    confirmPopupInfo(value) {
      value = value.trim();
      if (!value) {
        common_vendor.index.showToast({
          title: "内容不能为空！",
          icon: "none"
        });
        return;
      }
      if (value.length < 5) {
        common_vendor.index.showToast({
          title: "内容长度不能低于5",
          icon: "none"
        });
        return;
      }
      const updateData = {};
      if (this.editorType == "notification") {
        updateData[this.editorType] = {
          "content": value
        };
      } else {
        updateData[this.editorType] = value;
      }
      this.updateGroupInfo(updateData);
      this.$refs.popupInfo.close();
    },
    setAddGroupType() {
      if (!this.isAdmin)
        return;
      common_vendor.index.showActionSheet({
        itemList: ["自由加入", "需要验证权限", "禁止加入"],
        success: (e) => {
          let join_option = ["freeAccess", "needPermission", "disableApply"][e.tapIndex];
          this.updateGroupInfo({
            join_option
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/group/info.vue:296", "err: ", err);
        }
      });
    },
    updateGroupInfo(group) {
      return __async(this, null, function* () {
        this.conversation.group = Object.assign(this.conversation.group, group);
        yield db.collection("uni-im-group").doc(this.conversation.group_id).update(group);
      });
    },
    setGroupNotice() {
      return __async(this, null, function* () {
        if (uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
          this.$refs["popup-notice-list"].open();
          setTimeout(() => {
            this.$refs["noticeList"].load({
              group_id: this.conversation.group_id
            });
          }, 0);
        } else {
          common_vendor.index.navigateTo({
            url: "/uni_modules/uni-im/pages/group/notice/list?group_id=" + this.conversation.group_id
          });
        }
      });
    },
    setAvatar() {
      return __async(this, null, function* () {
        if (!this.isAdmin)
          return;
        const crop = {
          quality: 100,
          width: 600,
          height: 600,
          resize: true
        };
        common_vendor.index.chooseImage({
          count: 1,
          crop,
          success: (res) => __async(this, null, function* () {
            let tempFile = res.tempFiles[0], avatar_file = {
              extname: tempFile.path.split(".")[tempFile.path.split(".").length - 1]
            }, filePath = res.tempFilePaths[0];
            {
              filePath = yield new Promise((callback) => {
                common_vendor.index.navigateTo({
                  url: "/uni_modules/uni-id-pages/pages/users/cropImage/cropImage?path=" + filePath + `&options=${JSON.stringify(crop)}`,
                  animationType: "fade-in",
                  events: {
                    success: (url) => {
                      callback(url);
                    }
                  },
                  complete(e) {
                  }
                });
              });
            }
            let cloudPath = this.currentUid + "" + Date.now();
            avatar_file.name = cloudPath;
            common_vendor.index.showLoading({
              title: "更新中",
              mask: true
            });
            let {
              fileID
            } = yield common_vendor.tr.uploadFile({
              filePath,
              cloudPath,
              fileType: "image"
            });
            avatar_file.url = fileID;
            common_vendor.index.hideLoading();
            this.updateGroupInfo({
              avatar_file
            });
          })
        });
      });
    },
    joinGroup() {
      db.collection("uni-im-group-join").add({
        "group_id": this.conversation.group_id,
        "message": ""
      }).then((res) => {
        common_vendor.index.showToast({
          icon: "none",
          title: "已申请"
        });
      });
    },
    setMuteAllMembers(e) {
      this.conversation.group.member.dataList.forEach((member) => {
        member.mute_type += e.value ? 1 : -1;
      });
      this.updateGroupInfo({
        "mute_all_members": e.value
      });
    },
    changeConversationMute(e) {
      this.conversation.changeMute();
    }
  }
};
if (!Array) {
  const _component_uni_im_group_members = common_vendor.resolveComponent("uni-im-group-members");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_component_uni_im_group_members + _easycom_uni_list_item2 + _easycom_uni_im_img2 + _easycom_uni_list2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_list_item = () => "../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_im_img = () => "../../components/uni-im-img/uni-im-img.js";
const _easycom_uni_list = () => "../../../uni-list/components/uni-list/uni-list.js";
const _easycom_uni_popup_dialog = () => "../../../uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../../uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_im_img + _easycom_uni_list + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.conversation_id
  }, $data.conversation_id ? common_vendor.e({
    b: common_vendor.p({
      conversation_id: $data.conversation_id
    }),
    c: !$data.leave_group && !$options.isTmpGroup
  }, !$data.leave_group && !$options.isTmpGroup ? {
    d: common_vendor.o($options.changeConversationMute),
    e: common_vendor.p({
      title: "消息免打扰",
      switchChecked: $data.conversation.mute,
      showSwitch: true,
      switchColor: "#22b832"
    })
  } : {}, {
    f: common_vendor.f($data.editorFields, (val, key, i0) => {
      return {
        a: common_vendor.t($data.conversation.group[key]),
        b: key,
        c: common_vendor.o(($event) => $options.openPopupInfo(key), key),
        d: "1a8907e5-3-" + i0 + ",1a8907e5-1",
        e: common_vendor.p({
          title: val,
          showArrow: $data.isAdmin,
          clickable: $data.isAdmin
        })
      };
    }),
    g: common_vendor.o($options.setGroupNotice),
    h: common_vendor.p({
      title: "群公告",
      link: true
    }),
    i: common_vendor.p({
      width: "50px",
      height: "50px",
      src: $options.logoUrl || "/uni_modules/uni-im/static/avatarUrl.png",
      mode: ""
    }),
    j: common_vendor.o($options.setAvatar),
    k: common_vendor.p({
      title: "群头像",
      clickable: $data.isAdmin
    }),
    l: $data.isAdmin
  }, $data.isAdmin ? {
    m: common_vendor.t($options.join_option),
    n: common_vendor.o($options.setAddGroupType),
    o: common_vendor.p({
      title: "加群方式",
      note: "申请加入本群的验证规则",
      clickable: $data.isAdmin
    }),
    p: common_vendor.o($options.setMuteAllMembers),
    q: common_vendor.p({
      title: "全员禁言",
      switchChecked: $data.conversation.group.mute_all_members,
      showSwitch: true
    })
  } : {}, {
    r: $data.leave_group
  }, $data.leave_group ? {} : $options.isTmpGroup ? {} : $options.isBissnessGroup ? {} : {
    v: common_vendor.t($options.isGroupCreator ? "解散群聊" : "退出群聊"),
    w: common_vendor.o((...args) => $options.exitGroup && $options.exitGroup(...args))
  }, {
    s: $options.isTmpGroup,
    t: $options.isBissnessGroup,
    x: common_vendor.o($options.closePopupInfo),
    y: common_vendor.o($options.confirmPopupInfo),
    z: common_vendor.p({
      mode: "input",
      title: $data.editorFields[$data.editorType],
      placeholder: "请输入" + $data.editorFields[$data.editorType],
      duration: 2e3,
      ["before-close"]: true,
      value: $data.editorDefaultValue,
      maxlength: 500
    }),
    A: common_vendor.sr("popupInfo", "1a8907e5-9"),
    B: common_vendor.p({
      type: "dialog"
    })
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/group/info.js.map
