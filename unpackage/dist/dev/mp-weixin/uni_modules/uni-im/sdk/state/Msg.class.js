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
const uni_modules_uniIm_sdk_state_index = require("./index.js");
const uni_modules_uniIm_sdk_methods_index = require("../methods/index.js");
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const uni_modules_uniIm_sdk_ext_CloudData_class = require("../ext/CloudData.class.js");
const uni_modules_uniIm_sdk_state_MsgItem_class = require("./MsgItem.class.js");
const dbJQL = common_vendor.tr.databaseForJQL();
const dbJQLcmd = dbJQL.command;
class Msg extends uni_modules_uniIm_sdk_ext_CloudData_class.CloudData {
  constructor(conversation_id) {
    super();
    this.loadLimit = 10;
    this.conversation_id = conversation_id;
    this.isFull = false;
  }
  // 可见的消息列表（过滤掉不可见的消息，比如：消息撤回指令、更新群头像指令...）
  visibleDataList() {
    return this.dataList.filter((msg) => uni_modules_uniIm_sdk_utils_index.utils.isReadableMsg(msg));
  }
  __saveToLocal(datas, { canSetIsFull }) {
    return;
  }
  __beforeAdd(datas) {
    const currentConversation = uni_modules_uniIm_sdk_state_index.state.conversation.find(this.conversation_id);
    uni_modules_uniIm_sdk_state_index.state.extensions.invokeExts("before-add-msg", datas);
    datas.forEach((data) => __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      const conversation_time = currentConversation.update_time || currentConversation.client_create_time || 0;
      if (data.create_time <= conversation_time) {
        return;
      }
      (_b = (_a = uni_modules_uniIm_sdk_methods_index.methods.msgTypes.get(data.type)) == null ? void 0 : _a.beforeLocalAdd) == null ? void 0 : _b.call(_a, data, currentConversation);
      if (data.type === "revoke_msg") {
        return currentConversation.revokeMsg(data.body.msg_id, false);
      }
      if (data.type === "pay-notify" && data.from_uid === "system") {
        const { order_id, group_id, pay_channel, status } = data.body;
        let currentConversation2 = uni_modules_uniIm_sdk_state_index.state.conversation.find({ group_id });
        if (currentConversation2) {
          const msg = currentConversation2.msg.find({ body: { "order_id": order_id } });
          if (!msg) {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:96", "pay-notify 未找到订单消息", data);
            return;
          }
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:99", "pay-notify msg", msg);
          msg.body.pay_channel = pay_channel;
          msg.body.status = status || 1;
          msg.body.pay_time = data.create_time;
          msg.body.pay_notify = data;
        } else {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:105", "pay-notify 未找到会话", data);
        }
      }
      const current_uid = uni_modules_uniIm_sdk_state_index.state.currentUser._id;
      if (data.type === "system") {
        if (["group-exit", "group-expel"].includes(data.action)) {
          data.body.user_id_list.forEach((uid) => {
            currentConversation.group.member.remove({ "users": { "_id": uid } });
            currentConversation.group.member_count--;
          });
          if (data.body.user_id_list.includes(current_uid)) {
            uni_modules_uniIm_sdk_state_index.state.conversation.remove(currentConversation.id);
            uni_modules_uniIm_sdk_state_index.state.group.remove(currentConversation.group_id);
          }
        } else if (data.action === "group-dissolved") {
          uni_modules_uniIm_sdk_state_index.state.conversation.remove(currentConversation.id);
          uni_modules_uniIm_sdk_state_index.state.group.remove(currentConversation.group_id);
        } else if (data.action === "join-group") {
          const { new_member_list, user_id_list } = data.body;
          if (user_id_list.includes(current_uid)) {
            if (currentConversation.client_create_time < data.create_time) {
              const uniImCo = common_vendor.tr.importObject("uni-im-co", { customUI: true });
              let res = yield uniImCo.getConversationList({ "conversation_id": currentConversation.id });
              Object.assign(currentConversation, res.data[0]);
              currentConversation.msg.reset();
              currentConversation.group.reset();
              yield currentConversation.group.loadMore();
              currentConversation.has_unread_group_notification = !!currentConversation.group.notification;
            }
          } else {
            yield uni_modules_uniIm_sdk_state_index.state.users.get(new_member_list.map((i) => i.user_id));
            new_member_list.forEach((member) => {
              member.users = uni_modules_uniIm_sdk_state_index.state.users[member.user_id];
              currentConversation.group.member.add(member);
              currentConversation.group.member_count++;
            });
          }
        } else if (data.action.indexOf("update-group-info-") === 0) {
          if (data.action === "update-group-info-mute_all_members" && ((_c = currentConversation == null ? void 0 : currentConversation.group) == null ? void 0 : _c.mute_all_members) != ((_e = (_d = data == null ? void 0 : data.body) == null ? void 0 : _d.updateData) == null ? void 0 : _e.mute_all_members)) {
            const { mute_all_members } = data.body.updateData;
            currentConversation.group.member.dataList.forEach((member) => {
              member.mute_type += mute_all_members ? 1 : -1;
            });
          }
          currentConversation.group = Object.assign(currentConversation.group, data.body.updateData);
          data.body.updateData;
          if (data.action === "update-group-info-notification") {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:170", "收到群公告");
            currentConversation.has_unread_group_notification = true;
          }
        } else if (data.action === "set-group-admin") {
          const { user_id, addRole, delRole } = data.body;
          const { role } = currentConversation.group.member.find(user_id);
          if (addRole.length != 0) {
            role.push(...addRole);
          } else if (delRole.length != 0) {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:180", "delRole", delRole);
            delRole.forEach((r) => {
              common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:182", "r", r);
              common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:183", "role", role);
              const index = role.findIndex((i) => i === r);
              common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:185", "index", index);
              if (index > -1) {
                role.splice(index, 1);
              }
            });
          }
        } else if (data.action === "set-group-member-ext-plugin-order-info") {
          const { user_id, group_id, dcloud_plugin_order_info } = data.body;
          const member = currentConversation.group.member.find(user_id);
          if (!member.ext) {
            member.ext = {};
          }
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/state/Msg.class.js:200", "设置群成员插件订单信息", member);
          member.ext.dcloud_plugin_order_info = dcloud_plugin_order_info;
        }
      }
      if (
        // 如果收到的是群聊且带@的消息
        data.group_id && data.call_uid && // @所有人 或 @我
        (data.call_uid == "__ALL" || data.call_uid.includes(current_uid))
      ) {
        currentConversation.remind_msg_ids.push(data._id);
      }
    }));
    return datas.map((item) => new uni_modules_uniIm_sdk_state_MsgItem_class.MsgItem(item));
  }
  __afterAdd(datas, { canSetIsFull }) {
    datas.forEach((msg) => {
      common_vendor.watch(msg, (newMsg) => msg.__updateAfter(newMsg), { deep: true });
    });
    if (datas[0] && !datas[0].__isLocal) {
      const msgs = datas.filter((data) => {
        let needSave = uni_modules_uniIm_sdk_utils_index.utils.isReadableMsg(data);
        if (needSave) {
          return true;
        } else {
          return false;
        }
      });
      this.__saveToLocal(msgs, { canSetIsFull });
    }
    return datas;
  }
  __getLocalData(_0) {
    return __async(this, arguments, function* ({
      minTime = 0,
      maxTime = Date.now(),
      limit = this.loadLimit,
      _id = false,
      orderBy = {
        // asc 升序，desc 降序
        "create_time": "desc"
      }
    }) {
      return [];
    });
  }
  __get() {
    return __async(this, null, function* () {
      var _a, _b;
      let maxTime = ((_a = this.dataList[0]) == null ? void 0 : _a.create_time) || Date.now();
      let localData = [];
      if (this.isFull) {
        localData = yield this.__getLocalData({
          maxTime,
          limit: this.loadLimit,
          orderBy: {
            "create_time": "asc"
          }
        });
        if (localData.length === this.loadLimit) {
          return localData;
        }
      }
      maxTime = ((_b = localData[0]) == null ? void 0 : _b.create_time) || maxTime;
      const where = {
        "conversation_id": this.conversation_id
      };
      if (this.preWhere) {
        Object.assign(where, this.preWhere);
      }
      if (maxTime) {
        where.update_time = dbJQLcmd.lt(maxTime);
      }
      let data;
      let res = yield dbJQL.collection("uni-im-msg").where(where).limit(this.loadLimit - localData.length).orderBy("update_time", "desc").get();
      res.data.sort((a, b) => b.create_time - a.create_time);
      data = res.data.concat(localData);
      return data;
    });
  }
  __canSeaveToDataMap(msg) {
    var _a;
    return ((_a = msg._id) == null ? void 0 : _a.indexOf("temp_")) === -1;
  }
}
exports.Msg = Msg;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/Msg.class.js.map
