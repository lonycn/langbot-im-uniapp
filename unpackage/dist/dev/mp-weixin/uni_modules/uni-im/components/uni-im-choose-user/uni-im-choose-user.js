"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const _sfc_main = {
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Array,
      default: []
    },
    filterUids: {
      type: [Array, null],
      default: null
    },
    conversationId: {
      default: ""
    },
    memberListData: {
      type: [Array, null],
      default: null
    },
    title: {
      type: [String, null],
      default: null
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  computed: {
    userList() {
      return uni_modules_uniIm_sdk_index.uniIm.users.find(this.modelValue);
    }
  },
  methods: {
    deleteItem(index) {
      this.$emit("update:modelValue", this.modelValue.filter((_, i) => i !== index));
    },
    showMemberList() {
      this.$refs["member-list"].show({
        title: "添加话题成员",
        forceShowSearch: true,
        filter: (member) => !(this.filterUids || this.modelValue).includes(member.users._id),
        confirm: (uid) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-choose-user/uni-im-choose-user.vue:66", "uid--showMenberList-*", uid);
          this.$emit("update:modelValue", this.modelValue.concat(uid));
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_img2 = common_vendor.resolveComponent("uni-im-img");
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_member_list2 = common_vendor.resolveComponent("uni-im-member-list");
  (_easycom_uni_im_img2 + _easycom_uni_im_icons2 + _easycom_uni_icons2 + _easycom_uni_im_member_list2)();
}
const _easycom_uni_im_img = () => "../uni-im-img/uni-im-img.js";
const _easycom_uni_im_icons = () => "../uni-im-icons/uni-im-icons.js";
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_member_list = () => "../uni-im-member-list/uni-im-member-list.js";
if (!Math) {
  (_easycom_uni_im_img + _easycom_uni_im_icons + _easycom_uni_icons + _easycom_uni_im_member_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.title
  }, $props.title ? {
    b: common_vendor.t($props.title)
  } : {}, {
    c: common_vendor.f($options.userList, (user, index, i0) => {
      var _a;
      return {
        a: "4bdc7012-0-" + i0,
        b: common_vendor.p({
          width: "20",
          height: "20",
          borderRadius: "100%",
          src: ((_a = user == null ? void 0 : user.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
        }),
        c: common_vendor.t(user.nickname),
        d: common_vendor.o(($event) => $options.deleteItem(index), index),
        e: "4bdc7012-1-" + i0,
        f: index
      };
    }),
    d: common_vendor.p({
      code: "e61a",
      color: "#888",
      size: "10px"
    }),
    e: $props.multiple || $options.userList.length === 0
  }, $props.multiple || $options.userList.length === 0 ? {
    f: common_vendor.o($options.showMemberList),
    g: common_vendor.p({
      color: "#aaa",
      size: "16px",
      type: "plusempty"
    })
  } : {}, {
    h: common_vendor.sr("member-list", "4bdc7012-3"),
    i: common_vendor.p({
      conversationId: $props.conversationId,
      memberListData: $props.memberListData
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-choose-user/uni-im-choose-user.js.map
