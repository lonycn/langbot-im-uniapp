"use strict";
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const _sfc_main = {
  emits: ["viewMsg"],
  props: {
    msg: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      msgList: []
    };
  },
  computed: {
    title() {
      const { to_uid, from_uid, group_id } = this.msg.body.msgList[0] || {};
      if (group_id) {
        return this.msg.body.title;
      } else {
        let nickname1 = uni_modules_uniIm_sdk_index.uniIm.users.getNickname(to_uid);
        let nickname2 = uni_modules_uniIm_sdk_index.uniIm.users.getNickname(from_uid);
        return `${nickname1} 与 ${nickname2} 的聊天记录`;
      }
    }
  },
  mounted() {
    const msg = this.msg;
    this.msgList = msg.body.msgList || [];
    for (let i = 0; i < this.msgList.length; i++) {
      let msg2 = this.msgList[i];
      this.setNickname(msg2);
      msg2.content = typeof msg2.body === "string" ? msg2.body.replace(/<[^>]+>/g, "") : "[多媒体类型]";
    }
  },
  methods: {
    viewMsg() {
      this.$emit("viewMsg", this.msgList);
    },
    setNickname(msg) {
      let users = uni_modules_uniIm_sdk_index.uniIm.users[msg.from_uid];
      if (users) {
        msg.nickname = users.nickname;
      } else {
        const dbJQL = common_vendor.tr.databaseForJQL();
        dbJQL.collection("uni-id-users").doc(msg.from_uid).field("nickname").get().then((res) => {
          msg.nickname = res.data[0].nickname;
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.title),
    b: common_vendor.f($data.msgList.slice(0, 3), (item, index, i0) => {
      return {
        a: common_vendor.t(item.nickname),
        b: common_vendor.t(item.content),
        c: index
      };
    }),
    c: common_vendor.o((...args) => $options.viewMsg && $options.viewMsg(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/history.js.map
