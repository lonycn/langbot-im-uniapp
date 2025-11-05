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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const db = common_vendor.tr.database();
const _sfc_main = {
  emits: ["done"],
  data() {
    return {
      loading: true,
      hasMore: false,
      keyword: "",
      checkFriendIds: [],
      friendData: [],
      groupMemberUid: [],
      //选人进群时，已经在群里的人的id
      group_id: false,
      isFocus: false
    };
  },
  computed: {
    friendList() {
      return this.friendData.filter((item) => {
        return this.keyword == "" || item.nickname.toLowerCase().includes(this.keyword.toLowerCase());
      });
    },
    checkFriendNum() {
      return this.checkFriendIds.length > 0 ? "（" + this.checkFriendIds.length + "）" : "";
    },
    btnText() {
      return this.group_id ? "立即邀请" : "立即创建";
    },
    checkFriendsWidth() {
      return this.checkFriendIds.length > 6 ? "100%" : this.checkFriendIds.length * 80 + "px";
    },
    // checkFriendsSearchWidth() {
    // 	return this.checkFriendIds.length > 6 ? '360' : 720 - (this.checkFriendIds.length * 60)
    // },
    translateXWidth() {
      return this.checkFriendIds.length > 6 ? this.checkFriendIds.length * 65 : "60";
    },
    checkFriendImg() {
      return this.friendList.reduce((sum, current) => {
        if (this.checkFriendIds.includes(current._id)) {
          sum.push(current);
        }
        return sum;
      }, []).map((item) => item.avatar_file);
    }
  },
  onLoad(options) {
    return __async(this, null, function* () {
      this.setParam(options);
    });
  },
  methods: {
    setParam() {
      return __async(this, arguments, function* (options = {}) {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:86", "group_id", options);
        if (options.group_id) {
          this.group_id = options.group_id;
          if (!uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
            common_vendor.index.setNavigationBarTitle({
              title: "邀请新成员"
            });
          }
          let res = yield db.collection("uni-im-group-member").where({
            group_id: options.group_id
          }).get();
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:99", "res:查本群，成员 ", res);
          this.groupMemberUid = res.result.data.map((item) => item.user_id);
        }
        this.getFriendsData();
      });
    },
    getFriendsData() {
      return __async(this, null, function* () {
        let whereString = {};
        if (this.keyword) {
          whereString = `
          	"_id"		== 	"${this.keyword}" ||
          	"username"	== 	"${this.keyword}" || 
          	"nickname"	== 	"${this.keyword}" || 
          	"email"		== 	"${this.keyword}" || 
          	"mobile"	== 	"${this.keyword}" 
          `;
        }
        let res = yield db.collection(
          db.collection("uni-im-friend").where('"user_id" == $cloudEnv_uid').field("friend_uid,mark,class_name").getTemp(),
          db.collection("uni-id-users").where(whereString).field("_id,nickname,avatar_file").getTemp()
        ).get();
        let data = res.result.data;
        data.forEach((item, index) => {
          if (item.friend_uid[0]) {
            data[index] = item.friend_uid[0];
          } else {
            delete data[index];
          }
        });
        this.friendData = data;
        this.loading = false;
        this.hasMore = this.friendList.length != 0;
      });
    },
    doClear() {
      this.keyword = "";
      this.getFriendsData();
    },
    checkboxChange(user_id) {
      if (this.groupMemberUid.includes(user_id)) {
        return common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:140", "已经在群里了");
      }
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:142", "checkboxChange-value", user_id);
      this.checkFriendIds = this.checkFriendIds.includes(user_id) ? this.checkFriendIds.filter((item) => item != user_id) : this.checkFriendIds.concat(user_id);
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:144", "checkboxChange", this.checkFriendIds);
    },
    createGroup() {
      return __async(this, null, function* () {
        const uniImCo = common_vendor.tr.importObject("uni-im-co");
        let res = yield uniImCo.chooseUserIntoGroup({
          user_ids: this.checkFriendIds,
          group_id: this.group_id
        });
        this.checkFriendIds = [];
        if (this.group_id) {
          if (uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
            this.$emit("done");
          } else {
            common_vendor.index.navigateBack({
              delta: 1
            });
          }
        } else {
          common_vendor.index.redirectTo({
            url: "/uni_modules/uni-im/pages/chat/chat?conversation_id=group_" + res.data.group_id,
            animationDuration: 300,
            complete: (e) => {
              common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/createGroup/createGroup.vue:183", e);
            }
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_search_bar2 + _easycom_uni_icons2 + _easycom_uni_im_info_card2 + _easycom_uni_im_load_state2 + _easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_search_bar = () => "../../../../uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_icons = () => "../../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_info_card = () => "../../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_im_load_state = () => "../../../components/uni-im-load-state/uni-im-load-state.js";
const _easycom_uni_list_item = () => "../../../../uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../../uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_icons + _easycom_uni_im_info_card + _easycom_uni_im_load_state + _easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => {
      $options.doClear();
      $data.isFocus = true;
    }),
    b: common_vendor.o($options.doClear),
    c: common_vendor.o(($event) => $data.isFocus = true),
    d: common_vendor.o(($event) => $data.isFocus = false),
    e: common_vendor.o(($event) => $data.keyword = $event),
    f: common_vendor.p({
      placeholder: "搜索",
      bgColor: "#fff",
      radius: 100,
      isFocus: $data.isFocus,
      modelValue: $data.keyword
    }),
    g: common_vendor.f($options.friendList, (item, index, i0) => {
      var _a;
      return common_vendor.e({
        a: $data.groupMemberUid.includes(item._id) || $data.checkFriendIds.includes(item._id)
      }, $data.groupMemberUid.includes(item._id) || $data.checkFriendIds.includes(item._id) ? {
        b: "62fd5de2-3-" + i0 + "," + ("62fd5de2-2-" + i0),
        c: common_vendor.p({
          type: "checkmarkempty",
          color: "#FFF"
        })
      } : {}, {
        d: $data.groupMemberUid.includes(item._id) ? 1 : "",
        e: $data.checkFriendIds.includes(item._id) ? 1 : "",
        f: common_vendor.o(($event) => $options.checkboxChange(item._id), index),
        g: index,
        h: "62fd5de2-2-" + i0 + ",62fd5de2-1",
        i: common_vendor.p({
          ["avatar-circle"]: true,
          title: item.nickname,
          border: false,
          clickable: true,
          avatarUrl: ((_a = item.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
        })
      });
    }),
    h: common_vendor.p({
      status: $data.loading ? "loading" : $data.hasMore ? "hasMore" : "noMore",
      contentText: {
        "contentnomore": $options.friendList.length ? "没有更多好友" : "没有可以选择的好友"
      }
    }),
    i: common_vendor.p({
      border: false
    }),
    j: common_vendor.p({
      border: false
    }),
    k: common_vendor.t($options.btnText),
    l: common_vendor.t($options.checkFriendNum),
    m: $data.group_id ? !$data.checkFriendIds.length : false,
    n: common_vendor.o((...args) => $options.createGroup && $options.createGroup(...args)),
    o: $data.group_id ? 1 : ""
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/createGroup/createGroup.js.map
