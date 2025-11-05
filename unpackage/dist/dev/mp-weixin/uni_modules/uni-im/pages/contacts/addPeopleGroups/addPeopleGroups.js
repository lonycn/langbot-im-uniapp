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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const db = common_vendor.tr.database();
const _sfc_main = {
  data() {
    return {
      current: 0,
      loading: true,
      hasMore: false,
      activeIndex: 0,
      value: "",
      items: ["找人", "找群"],
      searchFocus: false,
      //是否展示搜索列表
      keyword: "",
      tabs: [
        {
          "title": "添加手机联系人",
          "url": ""
        },
        {
          "title": "扫一扫加好友",
          "url": ""
        },
        {
          "title": "查找陌生人",
          "url": ""
        }
      ],
      usersData: [],
      checkIndex: "",
      //申请加的群index
      groupData: []
    };
  },
  computed: __spreadProps(__spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["currentUser"])), {
    usersList() {
      let friendList = uni_modules_uniIm_sdk_index.uniIm.friend.dataList;
      return this.usersData.map((item) => {
        const isFriend = friendList.find((i) => i._id == item._id);
        return __spreadProps(__spreadValues({}, item), {
          isFriend
        });
      });
    },
    groupList() {
      let groupList = uni_modules_uniIm_sdk_index.uniIm.group.dataList;
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:105", "已经加入的groupList", groupList);
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:106", "查到的groupList", this.groupData);
      return this.groupData.map((item) => {
        const isExist = groupList.find((i) => i._id == item._id);
        return __spreadProps(__spreadValues({}, item), {
          isExist
        });
      });
    }
  }),
  onLoad(param) {
    this.setParam(param);
  },
  methods: {
    setParam(param) {
      if (param.group_id) {
        this.current = 1;
        this.setActiveIndex({ currentIndex: 1 });
        this.keyword = param.group_id;
        return this.doSearch();
      }
      this.getUserList();
      this.getGroupsList();
    },
    getGroupsList() {
      return __async(this, null, function* () {
        const limit = 100;
        const skip = this.groupData.length / limit;
        const res = yield db.collection("uni-im-group").where(`"user_id" != "${this.currentUser._id}"`).field("_id,name,avatar_file").orderBy("create_date", "desc").skip(skip).limit(limit).get();
        if (res.result.data.length) {
          this.loading = false;
          this.hasMore = true;
          this.groupData = res.result.data;
        }
      });
    },
    getUserList() {
      return __async(this, null, function* () {
        try {
          let res = yield db.collection("uni-id-users").where(`"_id" != "${this.currentUser._id}"`).field("_id,nickname,avatar_file").get();
          let data = res.result.data;
          if (data.length) {
            this.loading = false;
            this.hasMore = true;
            this.usersData = data;
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:164", e);
        }
      });
    },
    back() {
      common_vendor.index.navigateBack();
    },
    doSearch(e) {
      return __async(this, null, function* () {
        if (!this.keyword) {
          return this.activeIndex === 0 ? this.getUserList() : this.getGroupsList();
        }
        common_vendor.index.showLoading({
          title: "搜索中"
        });
        if (this.activeIndex) {
          const where = `
              /${this.keyword}/.test(name) || 
							"_id" == "${this.keyword}"
						`;
          const res = yield db.collection("uni-im-group").where(where).get();
          this.groupData = res.result.data;
        } else {
          const whereString = [
            "_id",
            "username",
            "nickname",
            "email",
            "mobile"
          ].map((item) => `"${item}" == "${this.keyword}"`).join(" || ");
          const res = yield db.collection("uni-id-users").where(whereString).field("_id,nickname,avatar_file").get();
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:202", res);
          this.usersData = res.result.data;
        }
        common_vendor.index.hideLoading();
      });
    },
    doClear() {
      if (this.keyword) {
        this.keyword = "";
        this.usersData = [];
        this.groupData = [];
        this.getUserList();
        this.getGroupsList();
      }
    },
    setActiveIndex(e) {
      if (this.activeIndex != e.currentIndex) {
        this.activeIndex = e.currentIndex;
      }
    },
    addUser(index) {
      this.checkIndex = index;
      this.$refs.popup.open();
    },
    confirm(value) {
      return __async(this, null, function* () {
        this.value = value;
        this.$refs.popup.close();
        if (this.activeIndex === 0) {
          const uniImCo = common_vendor.tr.importObject("uni-im-co");
          yield uniImCo.addFriendInvite({
            "to_uid": this.usersList[this.checkIndex]._id,
            "message": this.value
          }).then((res) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:244", "res: ", res);
            common_vendor.index.showToast({
              title: "已申请",
              icon: "none"
            });
          }).catch((err) => {
            common_vendor.index.showModal({
              content: err.message || "请求服务失败",
              showCancel: false
            });
          });
        } else {
          db.collection("uni-im-group-join").add({
            "group_id": this.groupList[this.checkIndex]._id,
            "message": this.value
          }).then((res) => {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:263", "res: ", res);
            common_vendor.index.showToast({
              icon: "none",
              title: "已申请"
            });
          }).catch((err) => {
            common_vendor.index.showModal({
              content: err.message || "请求服务失败",
              showCancel: false
            });
          });
        }
        setTimeout(() => {
          this.value = "";
        }, 100);
      });
    },
    close() {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.vue:281", "取消了");
      this.$refs.popup.close();
    }
  }
};
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_segmented_control2 + _easycom_uni_nav_bar2 + _easycom_uni_search_bar2 + _easycom_uni_im_info_card2 + _easycom_uni_im_load_state2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_segmented_control = () => "../../../../uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_nav_bar = () => "../../../../uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_search_bar = () => "../../../../uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_im_info_card = () => "../../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_im_load_state = () => "../../../components/uni-im-load-state/uni-im-load-state.js";
const _easycom_uni_popup_dialog = () => "../../../../uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../../../uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_nav_bar + _easycom_uni_search_bar + _easycom_uni_im_info_card + _easycom_uni_im_load_state + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.setActiveIndex),
    b: common_vendor.p({
      current: $data.current,
      values: $data.items,
      styleType: "button",
      activeColor: "#5fc08e"
    }),
    c: common_vendor.o($options.back),
    d: common_vendor.p({
      color: "#999",
      fixed: true,
      ["background-color"]: "#ffffff",
      ["status-bar"]: true,
      ["left-icon"]: "left"
    }),
    e: common_vendor.o($options.doSearch),
    f: common_vendor.o(($event) => $data.searchFocus = true),
    g: common_vendor.o(($event) => $data.searchFocus = false),
    h: common_vendor.o($options.doClear),
    i: common_vendor.o($options.doClear),
    j: common_vendor.o(($event) => $data.keyword = $event),
    k: common_vendor.p({
      placeholder: $data.activeIndex ? "搜索群名称/群号" : "搜索手机号/用户名/用户昵称",
      radius: 100,
      bgColor: "#eeeeee",
      modelValue: $data.keyword
    }),
    l: $data.activeIndex === 0
  }, $data.activeIndex === 0 ? common_vendor.e({
    m: $options.usersList.length
  }, $options.usersList.length ? {
    n: common_vendor.f($options.usersList, (item, index, i0) => {
      var _a;
      return common_vendor.e({
        a: item.isFriend
      }, item.isFriend ? {} : item._id === _ctx.currentUser._id ? {} : {
        c: common_vendor.o(($event) => $options.addUser(index), index)
      }, {
        b: item._id === _ctx.currentUser._id,
        d: index,
        e: "19343db8-3-" + i0,
        f: common_vendor.p({
          title: item.nickname,
          avatarCircle: true,
          avatar: ((_a = item.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
        })
      });
    })
  } : {
    o: common_vendor.p({
      status: $data.loading ? "loading" : $data.hasMore ? "hasMore" : "noMore"
    })
  }) : {}, {
    p: $data.activeIndex === 1
  }, $data.activeIndex === 1 ? common_vendor.e({
    q: $options.groupList.length
  }, $options.groupList.length ? {
    r: common_vendor.f($options.groupList, (item, index, i0) => {
      var _a;
      return common_vendor.e({
        a: item.isExist
      }, item.isExist ? {} : {
        b: common_vendor.o(($event) => $options.addUser(index), index)
      }, {
        c: index,
        d: "19343db8-5-" + i0,
        e: common_vendor.p({
          title: item.name,
          avatar: ((_a = item.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
        })
      });
    })
  } : {
    s: common_vendor.p({
      status: $data.loading ? "loading" : $data.hasMore ? "hasMore" : "noMore"
    })
  }) : {}, {
    t: common_vendor.o($options.close),
    v: common_vendor.o($options.confirm),
    w: common_vendor.p({
      mode: "input",
      title: $data.activeIndex ? "申请加群" : "申请添加好友",
      placeholder: "请输入验证信息",
      confirmText: "发送",
      message: "成功消息",
      duration: 2e3,
      ["before-close"]: true,
      value: $data.value,
      maxlength: 100
    }),
    x: common_vendor.sr("popup", "19343db8-7"),
    y: common_vendor.p({
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/addPeopleGroups/addPeopleGroups.js.map
