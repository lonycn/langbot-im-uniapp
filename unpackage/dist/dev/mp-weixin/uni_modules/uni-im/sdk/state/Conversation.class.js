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
const uni_modules_uniIm_sdk_ext_CloudData_class = require("../ext/CloudData.class.js");
const uni_modules_uniIm_sdk_init_getCloudMsg = require("../init/getCloudMsg.js");
const uni_modules_uniIm_sdk_state_ConversationItem_class = require("./ConversationItem.class.js");
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const uni_modules_uniIm_sdk_state_index = require("./index.js");
const uni_modules_uniIm_sdk_methods_users = require("../methods/users.js");
const uniImCo = common_vendor.tr.importObject("uni-im-co");
class Conversation extends uni_modules_uniIm_sdk_ext_CloudData_class.CloudData {
  constructor() {
    super();
    this.inheritedBy = "conversation";
    this.indexKey = "id";
    this.cloudUnreadCountObj = {};
    this.loadLimit = 15;
    this.typeList = [
      {
        title: "全部",
        value: "all",
        filter: () => true
      },
      {
        title: "未读",
        value: "unread",
        filter: (c) => c.unread_count > 0,
        needKeep: true
      },
      {
        title: "@我的",
        value: "has_remind_msg",
        filter: (c) => {
          var _a;
          return ((_a = c == null ? void 0 : c.remind_msg_ids) == null ? void 0 : _a.length) > 0;
        },
        needKeep: true
      },
      // 群聊
      {
        title: "群聊",
        value: "group",
        filter: (c) => c.group_id
      },
      // 单聊
      {
        title: "单聊",
        value: "single",
        filter: (c) => !c.group_id
      },
      {
        title: "星标",
        value: "is_star",
        filter: (c) => c.is_star
      }
    ];
  }
  __beforeFind(param) {
    if (typeof param === "string") {
      return { id: param };
    } else if (typeof param === "object" && param !== null && !Array.isArray(param)) {
      const { user_id, friend_uid, conversation_id: id } = param;
      if (id) {
        param.id = id;
        delete param.conversation_id;
      } else if (user_id) {
        param.friend_uid = friend_uid || user_id;
        delete param.user_id;
      }
      if ("source" in param) {
        const source = param.source;
        delete param.source;
        setTimeout(() => {
          const conversation = this.find(param);
          if (conversation) {
            conversation.source = source;
          }
        }, 0);
      }
      return param;
    }
  }
  __afterFind({ res, param }) {
    const friend_uid = (param == null ? void 0 : param.friend_uid) || (param == null ? void 0 : param.user_id);
    if (!res && friend_uid) {
      const conversationData = {
        friend_uid,
        "user_info": { "nickname": "" },
        "unread_count": 0,
        "user_id": uni_modules_uniIm_sdk_state_index.state.currentUser._id,
        "id": uni_modules_uniIm_sdk_utils_index.utils.getConversationId(friend_uid),
        "type": param.friend_uid ? 1 : 2,
        "msgList": [],
        "update_time": Date.now(),
        "customSortTime": Date.now(),
        // 是本地临时会话数据
        "is_temp": true
      };
      const conversation = this.add(conversationData);
      return conversation;
    }
    return res;
  }
  __beforeAdd(datas) {
    if (!Array.isArray(datas)) {
      datas = [datas];
    }
    return datas.reduce((resList, item, index) => {
      let conversation_item = uni_modules_uniIm_sdk_state_index.state.conversation.find(item.id);
      if (conversation_item) {
        resList.push(conversation_item);
        return resList;
      }
      if (item.group_id) {
        uni_modules_uniIm_sdk_state_index.state.group.set(item.group_info);
        delete item.group_info;
      } else {
        if (!item.is_temp) {
          uni_modules_uniIm_sdk_methods_users.$users.merge({ [item.friend_uid]: item.user_info });
        }
      }
      item.client_create_time = Date.now();
      try {
        let conversation = new uni_modules_uniIm_sdk_state_ConversationItem_class.ConversationItem(item);
        resList.push(conversation);
      } catch (e) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/Conversation.class.js:151", "ConversationItem error", e);
        uni_modules_uniIm_sdk_utils_index.utils.reportError(e);
      }
      return resList;
    }, []);
  }
  __afterAdd(datas) {
    if (!Array.isArray(datas)) {
      datas = [datas];
    }
    datas.forEach((conversation) => {
      const { msgList } = conversation;
      if (msgList) {
        msgList.sort((a, b) => a.create_time - b.create_time);
        conversation.msg.add(msgList, { canSetIsFull: true });
        delete conversation.msgList;
      }
    });
    setTimeout(() => {
      datas.forEach((conversation) => {
        const activeProperty = this.find(conversation.id).activeProperty();
        Object.keys(activeProperty).forEach((key) => {
          const item = activeProperty[key];
          conversation[key] = common_vendor.computed(item);
        });
      });
    }, 0);
  }
  __afterGet(datas) {
    var _a;
    if (datas && !Array.isArray(datas)) {
      const conversation = datas;
      const member = (_a = conversation.group) == null ? void 0 : _a.member;
      if (member == null ? void 0 : member.needLoadOnce) {
        member.needLoadOnce = false;
        setTimeout(() => member.loadMore(), 1e3);
      }
    }
  }
  __afterGetMore(datas) {
    if (this.dataList.length === 0 && datas.length > 0) {
      uni_modules_uniIm_sdk_init_getCloudMsg.getCloudMsg();
    }
  }
  __get(param) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const loadMoreType = ((_a = this.loadMore) == null ? void 0 : _a.type) || "all";
      const lastConversationKey = typeof loadMoreType === "string" ? loadMoreType : Object.keys(loadMoreType).join("-") + "_" + Object.values(loadMoreType).join("-");
      let conversation_id = param;
      if (typeof param === "object") {
        conversation_id = param.id || param.conversation_id;
      }
      const uniImCo2 = common_vendor.tr.importObject("uni-im-co", { customUI: true });
      const limit = this.loadLimit;
      const conversationDatas = this.dataList;
      let maxLastMsgCreateTime = false;
      let skip = 0;
      const group_id = param == null ? void 0 : param.group_id;
      if (!conversation_id && !group_id) {
        const conversationCount = conversationDatas.length;
        if (conversationCount !== 0) {
          const normalConversationCount = conversationDatas.filter((i) => !i.pinned).length;
          if (normalConversationCount === 0) {
            skip = conversationCount;
          } else {
            maxLastMsgCreateTime = ((_d = (_c = (_b = this.loadMore) == null ? void 0 : _b.lastConversation) == null ? void 0 : _c[lastConversationKey]) == null ? void 0 : _d.last_msg_create_time) || false;
            if (maxLastMsgCreateTime) {
              skip = conversationDatas.filter((i) => i.last_msg_create_time === maxLastMsgCreateTime).length;
            }
          }
        }
      }
      let res = yield uniImCo2.getConversationList({
        maxLastMsgCreateTime,
        limit,
        conversation_id,
        skip,
        // 是否要区分是否为置顶会话
        distinguishPinned: loadMoreType === "all",
        type: loadMoreType,
        group_id
      });
      if (!conversation_id) {
        if (typeof this.loadMore.lastConversation == "object") {
          this.loadMore.lastConversation[lastConversationKey] = res.data[res.data.length - 1];
        } else {
          this.loadMore.lastConversation = { [lastConversationKey]: res.data[res.data.length - 1] };
        }
      }
      return res.data;
    });
  }
  // 统计所有消息的未读数
  unreadCount() {
    const conversationDatas = uni_modules_uniIm_sdk_state_index.state.conversation.dataList;
    const cloudUnreadCountObj = uni_modules_uniIm_sdk_state_index.state.conversation.cloudUnreadCountObj;
    const localUnreadCountObj = conversationDatas.reduce((sum, item, index, array) => {
      const { id, mute, unread_count } = item;
      if (id in cloudUnreadCountObj || !mute && unread_count) {
        sum[id] = mute ? 0 : unread_count;
      }
      return sum;
    }, {});
    const unreadCountObj = __spreadValues(__spreadValues({}, cloudUnreadCountObj), localUnreadCountObj);
    return Object.values(unreadCountObj).reduce((sum, item) => sum + item, 0);
  }
  /**
   * 清空所有未读消息数
   */
  clearUnreadCount() {
    uniImCo.clearUnreadCount().then((res) => {
      let conversationDatas = uni_modules_uniIm_sdk_state_index.state.conversation.dataList.filter((i) => i.unread_count > 0);
      conversationDatas.forEach((i) => {
        i.unread_count = 0;
      });
      this.cloudUnreadCountObj = {};
    }).catch((err) => {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/state/Conversation.class.js:291", "clearUnreadCount err", err);
    });
  }
  // 删除会话后，如果当前选中的会话是该会话，则清空当前选中的会话
  __afterRemove(item) {
    if (uni_modules_uniIm_sdk_state_index.state.currentConversationId == item.id) {
      uni_modules_uniIm_sdk_state_index.state.currentConversationId = null;
    }
  }
}
exports.Conversation = Conversation;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/Conversation.class.js.map
