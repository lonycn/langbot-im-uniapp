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
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniImConversation",
  props: {
    conversation: {
      type: Object,
      default: () => {
      }
    }
  },
  emits: ["click"],
  computed: {
    redNote() {
      if (this.conversation.hasDraft) {
        return "[草稿]";
      } else if (this.conversation.remind_msg_ids.length) {
        return "[@我]";
      } else if (this.conversation.unread_group_notice_id) {
        return "[有未读群公告]";
      }
      return "";
    },
    friendlyTime() {
      let timestamp = this.conversation.time + uni_modules_uniIm_sdk_index.uniIm.heartbeat * 0;
      let friendlyTime = uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(timestamp);
      let friendlyTimeArr = friendlyTime.split(" ");
      let friendlyTimeArrL = friendlyTimeArr.length;
      if (friendlyTimeArrL == 3 && friendlyTime.includes("/")) {
        friendlyTime = friendlyTimeArr[0];
      }
      return friendlyTime;
    }
  },
  data() {
    let avatarOverlayList = uni_modules_uniIm_sdk_index.uniIm.extensions.invokeExts("conversation-avatar-overlay", this.conversation).filter((result) => result && result.component).map((result) => {
      return {
        component: common_vendor.markRaw(result.component),
        props: result.props || {},
        handlers: result.handlers || {}
      };
    });
    return {
      avatarUrl: "/uni_modules/uni-im/static/avatarUrl.png",
      avatarOverlayList
    };
  },
  watch: {
    "conversation.avatar_file": {
      handler(avatar_file) {
        return __async(this, null, function* () {
          if (avatar_file == null ? void 0 : avatar_file.url) {
            this.avatarUrl = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(avatar_file.url);
          }
        });
      },
      immediate: true
    }
  },
  methods: {
    $isCementing(is, name) {
      var _a;
      if (is.name)
        is = is.name;
      return name == ((_a = is == null ? void 0 : is.replace) == null ? void 0 : _a.call(is, /-(.?)/g, (match, c) => c.toUpperCase()).replace("-", ""));
    },
    handleClick() {
      this.$emit("click", this.conversation);
    }
  }
};
if (!Array) {
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  _easycom_uni_im_info_card2();
}
const _easycom_uni_im_info_card = () => "../uni-im-info-card/uni-im-info-card.js";
if (!Math) {
  _easycom_uni_im_info_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.avatarOverlayList, (overlay, k0, i0) => {
      return {
        a: overlay.component.name
      };
    }),
    b: $props.conversation.id,
    c: common_vendor.o($options.handleClick),
    d: common_vendor.p({
      id: $props.conversation.id,
      title: $props.conversation.title,
      note: $props.conversation.note,
      ["red-note"]: $options.redNote,
      tags: $props.conversation.tags,
      avatarUrl: $data.avatarUrl,
      time: $options.friendlyTime,
      badge: $props.conversation.unread_count,
      mute: $props.conversation.mute,
      pinned: $props.conversation.pinned,
      is_star: $props.conversation.is_star,
      link: true
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-conversation/uni-im-conversation.js.map
