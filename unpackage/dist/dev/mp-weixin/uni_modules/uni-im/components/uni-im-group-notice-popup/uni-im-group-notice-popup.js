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
const groupNotice = () => "../uni-im-msg/types/group-notice.js";
const _sfc_main = {
  options: {
    styleIsolation: "shared"
    // 解除样式隔离
  },
  components: {
    groupNotice
  },
  data() {
    return {
      notice: {},
      isOpened: false
    };
  },
  watch: {
    isOpened(val) {
      if (val) {
        uni_modules_uniIm_sdk_index.uniIm.onMsg(this.hasNewMsg);
      } else {
        uni_modules_uniIm_sdk_index.uniIm.offMsg(this.hasNewMsg);
        this.notice = {};
      }
    }
  },
  methods: {
    hasNewMsg(res) {
      const msg = res.data.payload.data;
      if (msg.action == "setUnreadGroupNoticeId") {
        if (msg.body.type === "delete" && this.notice._id === msg.body.notice_id) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-group-notice-popup/uni-im-group-notice-popup.vue:47", "删除群公告");
          this.isOpened = false;
          this.$refs["group-notice-popup"].close();
          common_vendor.index.showToast({
            title: "此群公告已被删除",
            icon: "none"
          });
        }
      }
    },
    open(_0) {
      return __async(this, arguments, function* ({ group_id, notice_id }) {
        if (this.isOpened) {
          this.$refs["group-notice-popup"].close();
          open.call(this);
        } else {
          open.call(this);
        }
        function open() {
          return __async(this, null, function* () {
            this.isOpened = true;
            const dbJQL = common_vendor.tr.databaseForJQL();
            const res = yield dbJQL.collection("uni-im-group-notice").where({ group_id, _id: notice_id }).orderBy("create_time", "desc").limit(1).get();
            this.notice = res.data[0];
            common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-group-notice-popup/uni-im-group-notice-popup.vue:74", "群公告", res, "this.notice", this.notice);
            this.conversation = yield uni_modules_uniIm_sdk_index.uniIm.conversation.get("group_" + this.notice.group_id);
            this.$refs["group-notice-popup"].open();
          });
        }
      });
    },
    close() {
      this.isOpened = false;
      this.$refs["group-notice-popup"].close();
      const db = common_vendor.tr.database();
      db.collection("uni-im-conversation").where({
        id: this.conversation.id,
        user_id: uni_modules_uniIm_sdk_index.uniIm.currentUser._id
      }).update({
        unread_group_notice_id: ""
      }).then((res) => {
        this.conversation.unread_group_notice_id = "";
        common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-group-notice-popup/uni-im-group-notice-popup.vue:92", "群公告设为已读，成功", res);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/components/uni-im-group-notice-popup/uni-im-group-notice-popup.vue:94", "群公告设为已读，失败", err);
      });
    }
  }
};
if (!Array) {
  const _component_group_notice = common_vendor.resolveComponent("group-notice");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_component_group_notice + _easycom_uni_popup2)();
}
const _easycom_uni_popup = () => "../../../uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.close && $options.close(...args)),
    b: common_vendor.p({
      msg: {
        body: {
          content: this.notice.content
        },
        create_time: $data.notice.create_time
      }
    }),
    c: common_vendor.sr("group-notice-popup", "2aae7e56-0"),
    d: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-group-notice-popup/uni-im-group-notice-popup.js.map
