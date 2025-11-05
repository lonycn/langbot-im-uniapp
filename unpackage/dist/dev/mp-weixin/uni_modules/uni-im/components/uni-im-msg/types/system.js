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
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const common_vendor = require("../../../../../common/vendor.js");
const groupNotice = () => "./group-notice.js";
const _sfc_main = {
  components: {
    groupNotice
  },
  data() {
    return {
      create_time: 0
    };
  },
  props: {
    msg: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    friendlyTime() {
      return uni_modules_uniIm_sdk_index.uniIm.utils.toFriendlyTime(this.create_time || this.msg.create_time || this.msg.client_create_time);
    },
    content() {
      const msg = this.msg;
      if (msg.action.indexOf("update-group-info-") === 0) {
        const key = Object.keys(msg.body.updateData)[0];
        const value = msg.body.updateData[key];
        if (key == "notification") {
          this.create_time = value.create_time;
          return value.content;
        } else if (key == "avatar_file") {
          return "群聊头像已更新";
        } else if (key == "mute_all_members") {
          return value ? "已开启“全员禁言”" : "已关闭“全员禁言”";
        } else {
          return {
            "name": " 群聊名称",
            "introduction": "群简介"
          }[key] + "已更新为：" + value;
        }
      } else if (["join-group", "group-exit", "group-expel"].includes(msg.action)) {
        const nicknameList = [];
        msg.body.user_id_list.forEach((user_id) => __async(this, null, function* () {
          const nickname = uni_modules_uniIm_sdk_index.uniIm.users.getNickname(user_id);
          nicknameList.push(nickname);
        }));
        let actionName = {
          "join-group": "加入群聊",
          "group-exit": "退出群聊",
          "group-expel": "被踢出群聊"
        }[msg.action];
        return nicknameList.join(" , ") + actionName;
      } else if (msg.action === "group-dissolved") {
        return "此群聊已被解散";
      } else if (msg.action === "set-group-admin") {
        const { user_id, addRole, delRole } = msg.body;
        const nickname = uni_modules_uniIm_sdk_index.uniIm.users.getNickname(user_id);
        return `已将"${nickname}"${addRole.includes("admin") ? "添加为群管理员" : "从群管理员中移除"}`;
      } else {
        return msg.body;
      }
    }
  },
  mounted() {
    return __async(this, null, function* () {
    });
  }
};
if (!Array) {
  const _component_group_notice = common_vendor.resolveComponent("group-notice");
  _component_group_notice();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.content
  }, $options.content ? common_vendor.e({
    b: $props.msg.action === "setUnreadGroupNoticeId"
  }, $props.msg.action === "setUnreadGroupNoticeId" ? {
    c: common_vendor.p({
      msg: $props.msg
    })
  } : {
    d: common_vendor.t($options.friendlyTime),
    e: common_vendor.t($options.content)
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/system.js.map
