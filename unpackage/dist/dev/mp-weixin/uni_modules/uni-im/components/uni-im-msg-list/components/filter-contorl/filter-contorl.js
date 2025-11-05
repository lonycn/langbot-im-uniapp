"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const _sfc_main = {
  emits: ["showMenberList", "change"],
  props: {
    conversationId: {
      default: ""
    }
  },
  data() {
    return {
      userIdList: []
    };
  },
  watch: {
    userIdList(newVal) {
      this.$emit("change", newVal);
    }
  },
  methods: {
    onchange(userIdList) {
      this.userIdList = userIdList;
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  const _easycom_uni_im_choose_user2 = common_vendor.resolveComponent("uni-im-choose-user");
  (_easycom_uni_im_icons2 + _easycom_uni_im_choose_user2)();
}
const _easycom_uni_im_icons = () => "../../../uni-im-icons/uni-im-icons.js";
const _easycom_uni_im_choose_user = () => "../../../uni-im-choose-user/uni-im-choose-user.js";
if (!Math) {
  (_easycom_uni_im_icons + _easycom_uni_im_choose_user)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userIdList.length
  }, $data.userIdList.length ? {
    b: common_vendor.o(($event) => $data.userIdList = []),
    c: common_vendor.p({
      code: "e61a",
      color: "#999",
      size: "12px"
    }),
    d: common_vendor.o(($event) => $data.userIdList = $event),
    e: common_vendor.p({
      title: "相关成员",
      conversationId: $props.conversationId,
      modelValue: $data.userIdList
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg-list/components/filter-contorl/filter-contorl.js.map
