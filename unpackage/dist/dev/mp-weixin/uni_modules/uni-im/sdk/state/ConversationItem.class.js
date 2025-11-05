"use strict";
var __defProp = Object.defineProperty;
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
const uni_modules_uniIm_sdk_state_index = require("./index.js");
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const uni_modules_uniIm_sdk_methods_extensions = require("../methods/extensions.js");
const uni_modules_uniIm_sdk_state_Msg_class = require("./Msg.class.js");
const db = common_vendor.tr.database();
const uniImCo = common_vendor.tr.importObject("uni-im-co", { customUI: true });
class ConversationItem {
  constructor(data) {
    var _a, _b;
    if (!data.group_id && !data.user_info) {
      delete data.client_create_time;
      throw new Error("会话列表失效，疑似关联用户/群被删除(请改为软删除避免系统异常）data:" + JSON.stringify(data));
    }
    this.chatInputContent = "";
    this.remind_msg_ids = [];
    this.msg = new uni_modules_uniIm_sdk_state_Msg_class.Msg(data.id);
    this.client_create_time = Date.now();
    this.leave = false;
    this.pinned = false;
    this.tags = [];
    data.isInit = true;
    Object.assign(this, data);
    this.readRemindMsg = (id) => {
      const remind_msg_ids = uni_modules_uniIm_sdk_state_index.state.conversation.find(this.id).remind_msg_ids;
      if (id) {
        remind_msg_ids.splice(remind_msg_ids.indexOf(id), 1);
        common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:44", "readRemindMsg", id, remind_msg_ids);
      } else {
        id = remind_msg_ids.pop();
      }
      if (id) {
        uniImCo.removeRemindMsgId({
          conversation_id: this.id,
          msg_id: id
        }).then((e) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:53", "removeRemindMsgId success", id, e);
        });
      }
      return id;
    };
    if (this.group_id) {
      this.group = uni_modules_uniIm_sdk_state_index.state.group.find(this.group_id);
      if (!this.group) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:63", "群聊不存在", this);
        throw new Error("群聊不存在");
      }
      Promise.all(uni_modules_uniIm_sdk_methods_extensions.$extensions.invokeExts("conversation-tags", this)).then((tags) => {
        tags = tags.filter((tag) => tag);
        if (tags.length === 0) {
          this.tags = ["群聊"];
        } else {
          uni_modules_uniIm_sdk_state_index.state.conversation.find(this.id).tags = tags;
        }
      });
      const fieldList = [
        {
          "introduction": ""
        },
        {
          "notification": {
            "content": false
          }
        },
        {
          "avatar_file": {
            "url": ""
          }
        },
        {
          "mute_all_members": false
          // 全员禁言
        }
      ];
      fieldList.forEach((item) => {
        const key = Object.keys(item)[0];
        if (!this.group[key]) {
          this.group[key] = item[key];
        }
      });
      this.user_info = false;
    } else {
      this.group = false;
      if (this.is_temp) {
        this.user_info = {};
        uni_modules_uniIm_sdk_state_index.state.users.get(this.friend_uid).then((userInfo) => {
          uni_modules_uniIm_sdk_state_index.state.conversation.find(this.id).user_info = userInfo;
        });
      } else {
        this.user_info = uni_modules_uniIm_sdk_state_index.state.users[this.friend_uid];
      }
      const real_name = (_b = (_a = this.user_info) == null ? void 0 : _a.realname_auth) == null ? void 0 : _b.real_name;
      if (real_name) {
        this.tags = [real_name];
      }
    }
    this.activeProperty().init();
  }
  /**
   * 会话未读消息数清零。
   */
  clearUnreadCount() {
    setTimeout(() => {
      this.unread_count = 0;
    }, 100);
    common_vendor.tr.database().collection("uni-im-conversation").where({
      user_id: uni_modules_uniIm_sdk_state_index.state.currentUser._id,
      id: this.id
    }).update({
      "unread_count": 0
    }).then((e) => {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:144", "设置为已读", e.result.updated);
    }).catch((err) => {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:146", "设置为已读失败", err);
    });
  }
  /** 撤回消息。
   * @param {object} msg - 参数对象
   * @param {string} msg._id - 消息id
   * @param {string} msg.msg_id - 消息id和_id二选一
   * @param {string} msg.conversation_id - 所属会话的id
   * @param {number} msg.create_time - 创建时间
   * @param {boolean} [submit=true] -  是否需要提交；操作撤回端需要提交，被动撤回消息端无需提交
   */
  revokeMsg(msg_id, submit = true) {
    return __async(this, null, function* () {
      const msg = this.msg.find(msg_id);
      if (!msg) {
        return common_vendor.index.__f__("warn", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:162", "内存中没有找到此消息（当前用户可能还没点开相关会话），无需撤回", msg_id);
      }
      if (submit) {
        msg.before_revoke_body = msg.body;
        msg.revoke_ing = true;
        try {
          yield uniImCo.sendMsg({
            "type": "revoke_msg",
            "body": { msg_id }
          });
        } catch (err) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:177", "err", err);
          msg.body = msg.before_revoke_body;
          delete msg.before_revoke_body;
          delete msg.revoke_ing;
          return common_vendor.index.showToast({
            title: err.message,
            icon: "none"
          });
        }
        delete msg.revoke_ing;
      }
      msg.is_revoke = true;
      msg.body = "[此消息已被撤回]";
    });
  }
  /**
   * 获取用户信息。
   */
  getUsersInfo() {
    return this.group_id ? this.group.member.dataList : {
      [this.user_info._id]: this.user_info
    };
  }
  /**
   * changeMute
   */
  changeMute() {
    this.mute = !this.mute;
    const db2 = common_vendor.tr.database();
    db2.collection("uni-im-conversation").where({
      user_id: this.user_id,
      id: this.id
    }).update({
      "mute": this.mute
    }).then((e) => {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:219", "updated 消息免打扰设置", e.result.updated, this._id);
    }).catch(() => {
      common_vendor.index.showToast({
        title: "服务端错误，消息免打扰设置失败，请稍后重试",
        icon: "none"
      });
      this.mute = !this.mute;
    });
  }
  /**
   * 设置响应式属性。
   * @param {Object} data
   */
  activeProperty(data) {
    this._leave = this.leave;
    this._update_time = this.update_time || this.create_time;
    const _conversation = this;
    const activeProperty = {
      title() {
        return _conversation.group_id ? _conversation.group.name : _conversation.user_info.nickname;
      },
      avatar_file() {
        return _conversation.group_id ? _conversation.group.avatar_file : _conversation.user_info.avatar_file;
      },
      leave: {
        get() {
          if (_conversation.msg.dataList.length === 0) {
            return _conversation._leave;
          } else {
            let last_msg = _conversation.msg.dataList[_conversation.msg.dataList.length - 1];
            return "group-dissolved" === last_msg.action || ["group-exit", "group-expel"].includes(last_msg.action) && last_msg.body.user_id_list.includes(uni_modules_uniIm_sdk_state_index.state.currentUser._id);
          }
        },
        set(value) {
          _conversation._leave = value;
        }
      },
      isMuteAllMembers() {
        try {
          if (!_conversation.group_id)
            return false;
          const member = _conversation.group.member.find(uni_modules_uniIm_sdk_state_index.state.currentUser._id);
          return member && !member.role.includes("admin") && _conversation.group.mute_all_members;
        } catch (e) {
          common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:266", "isMuteAllMembers", e, _conversation);
          common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:267", "isMuteAllMembers", 1, _conversation.group);
          common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:268", "isMuteAllMembers", 2, _conversation.group.member);
          common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:269", "isMuteAllMembers", 3, _conversation.group.member.find);
          common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:270", "isMuteAllMembers", 4, typeof _conversation.group.member.find);
        }
      },
      // 最后一条可见消息
      _last_visible_msg() {
        const visibleMsgList = _conversation.msg.visibleDataList();
        const vml = visibleMsgList.length;
        return vml > 0 ? visibleMsgList[vml - 1] : false;
      },
      // 最后一条可见消息的时间，也被用于排序会话
      time() {
        const last_visible_msg = _conversation._last_visible_msg;
        let time = last_visible_msg ? last_visible_msg.create_time || last_visible_msg.client_create_time : _conversation.update_time;
        return Math.max(time, _conversation.customSortTime || 0);
      },
      // 最后一条可见消息的内容
      note() {
        let note = _conversation.last_msg_note || "暂无聊天记录";
        let chatInputContent = _conversation.chatInputContent;
        if (typeof chatInputContent === "object") {
          chatInputContent = chatInputContent.text || "[富文本消息]";
        } else {
          chatInputContent = chatInputContent.replace(/&nbsp;/g, " ").trim();
        }
        _conversation.hasDraft = chatInputContent && uni_modules_uniIm_sdk_state_index.state.currentConversationId != _conversation.id;
        let last_visible_msg = _conversation._last_visible_msg;
        if (_conversation.hasDraft) {
          note = chatInputContent;
          last_visible_msg = {
            body: chatInputContent,
            type: "text"
          };
        }
        if (last_visible_msg) {
          JSON.parse(JSON.stringify(last_visible_msg));
          note = uni_modules_uniIm_sdk_utils_index.utils.getMsgNote(last_visible_msg);
        }
        note = note.replace(/\\n|\\r|\n|\r|&nbsp;|&lt;|&gt;|&amp;/g, " ");
        const { nickname } = last_visible_msg;
        if (_conversation.group_id && nickname) {
          note = nickname + ": " + note;
        }
        return note.trim();
      },
      // 刷新会话的更新时间
      update_time: {
        get() {
          let update_time = _conversation._update_time;
          let msgLength = _conversation.msg.dataList.length;
          if (msgLength > 0) {
            let last_msg = _conversation.msg.dataList[msgLength - 1];
            let last_msg_time = last_msg.create_time || last_msg.client_create_time;
            if (last_msg_time > update_time) {
              update_time = last_msg_time;
            }
          }
          return update_time;
        },
        set(value) {
          _conversation._update_time = value;
        }
      }
    };
    let res = __spreadValues({
      init() {
        Object.keys(activeProperty).forEach((key) => {
          let item = activeProperty[key];
          if (typeof activeProperty[key] != "function") {
            item = activeProperty[key].get;
          }
          _conversation[key] = item();
        });
      }
    }, activeProperty);
    Object.defineProperty(res, "init", {
      // 设置init方法不可枚举
      enumerable: false
    });
    return res;
  }
  // 隐藏会话
  hide() {
    return __async(this, null, function* () {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:367", "hidden######");
      this.hidden = true;
      let res = yield db.collection("uni-im-conversation").where({
        user_id: this.user_id,
        id: this.id
      }).update({
        "hidden": true
      });
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:378", "updated hidden", res);
      return res;
    });
  }
  // 设置未读消息数
  setUnreadCount(count) {
    return __async(this, null, function* () {
      const oldCount = this.unread_count;
      this.unread_count = count;
      let res = yield db.collection("uni-im-conversation").where({
        user_id: this.user_id,
        id: this.id
      }).update({
        "unread_count": count
      }).catch((err) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:396", "setUnreadCount err", err);
        this.unread_count = oldCount;
      }).then((e) => {
      });
      return res;
    });
  }
  changeIsStar() {
    return __async(this, null, function* () {
      const oldIsStar = this.is_star;
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:406", "setIsStar", oldIsStar);
      this.is_star = !oldIsStar;
      let res = yield db.collection("uni-im-conversation").where({
        user_id: this.user_id,
        id: this.id
      }).update({
        "is_star": this.is_star
      }).catch((err) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:418", "setIsStar err", err);
        this.is_star = oldIsStar;
      }).then((e) => {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/ConversationItem.class.js:422", "setUnreadCount updated", e.result.updated);
      });
      return res;
    });
  }
}
exports.ConversationItem = ConversationItem;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/ConversationItem.class.js.map
