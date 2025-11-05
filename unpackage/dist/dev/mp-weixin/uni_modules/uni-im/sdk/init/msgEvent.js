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
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const uni_modules_uniIm_sdk_methods_extensions = require("../methods/extensions.js");
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
uni_modules_uniIm_sdk_state_index.state.ext.onMsgFnList = [];
const msgEvent = {
  emitMsg(res) {
    if (uni_modules_uniIm_sdk_state_index.state.isDisabled) {
      return common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/msgEvent.js:14", "uniIm isDisabled");
    }
    if (res.data.payload.device_id == uni_modules_uniIm_sdk_state_index.state.systemInfo.deviceId) {
      return common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/msgEvent.js:17", "当前设备发的消息，不用接收；忽略");
    }
    uni_modules_uniIm_sdk_state_index.state.ext.onMsgFnList.forEach((fn) => {
      fn(res);
    });
  },
  onMsg(res) {
    uni_modules_uniIm_sdk_state_index.state.ext.onMsgFnList.push(res);
  },
  offMsg(fn) {
    uni_modules_uniIm_sdk_state_index.state.ext.onMsgFnList = uni_modules_uniIm_sdk_state_index.state.ext.onMsgFnList.filter((item) => item != fn);
  }
};
msgEvent.onMsg((res) => __async(exports, null, function* () {
  const {
    payload
  } = res.data;
  const msg = payload.data;
  if (msg.LongMsg) {
    const db = common_vendor.tr.database();
    let res2 = yield db.collection("uni-im-msg").where({
      "_id": msg._id,
      "conversation_id": msg.conversation_id
      // conversation_id 必传否则会被触发器拦截
    }).get();
    if (res2.result.errCode == 0) {
      payload.data.body = res2.result.data[0].body;
    } else {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/msgEvent.js:54", "超长文本类型消息查库失败", msg._id);
    }
  }
  yield Promise.all(uni_modules_uniIm_sdk_methods_extensions.$extensions.invokeExts("before-on-im-msg", msg));
  if (msg.nickname) {
    const { nickname, avatar_file, from_uid: _id } = msg;
    const aboutUser = uni_modules_uniIm_sdk_state_index.state.users[_id];
    if (aboutUser) {
      aboutUser.nickname = nickname;
      aboutUser.avatar_file = avatar_file;
    } else {
      uni_modules_uniIm_sdk_state_index.state.users[_id] = { nickname, avatar_file };
    }
  }
  const {
    conversation_id,
    group_id
  } = msg;
  let conversation = uni_modules_uniIm_sdk_state_index.state.conversation.find(conversation_id);
  let isNewCreateConversation = false;
  if (!conversation) {
    isNewCreateConversation = true;
    conversation = yield uni_modules_uniIm_sdk_state_index.state.conversation.get(conversation_id);
  }
  if (!conversation) {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/msgEvent.js:89", "找不到会话对象 id:" + conversation_id);
    return;
  }
  if (msg.type == "clear-conversation-unreadCount") {
    if (conversation.update_time < msg.create_time) {
      conversation.update_time = msg.create_time;
      conversation.unread_count = 0;
    }
    return;
  }
  if (msg.action == "setUnreadGroupNoticeId") {
    if (msg.body.type != "add") {
      conversation.msg.dataList.forEach((item) => {
        if (item.body.notice_id == msg.body.notice_id) {
          item.is_revoke = true;
        }
      });
    }
    if (msg.body.type === "delete") {
      if (conversation.unread_group_notice_id === msg.body.notice_id) {
        conversation.unread_group_notice_id = false;
      }
      return;
    } else {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/msgEvent.js:135", "设置群公告提示符", msg.body.notice_id);
      conversation.unread_group_notice_id = false;
      yield uni_modules_uniIm_sdk_utils_index.utils.sleep(100);
      conversation.unread_group_notice_id = msg.body.notice_id;
    }
  }
  const isReadableMsg = uni_modules_uniIm_sdk_utils_index.utils.isReadableMsg(msg);
  const isMuteMsg = uni_modules_uniIm_sdk_utils_index.utils.isMuteMsg(msg);
  isReadableMsg && // 会话不是免打扰的
  !conversation.mute && // 消息不是系统配置了免打扰的
  !isMuteMsg && // 不是自己发的消息
  msg.from_uid != uni_modules_uniIm_sdk_state_index.state.currentUser._id;
  if (!conversation.msg.find(msg._id)) {
    conversation.msg.add(msg);
    if (
      // 不是正在对话的会话，且不是自己发的消息，就给会话的未读消息数+1
      uni_modules_uniIm_sdk_state_index.state.currentConversationId != msg.conversation_id && // 为可读消息
      isReadableMsg && // 消息不是系统配置了免打扰的
      !isMuteMsg && msg.from_uid != uni_modules_uniIm_sdk_state_index.state.currentUser._id && // 新创建的会话直接读取云端的未读消息数，本地不需要 ++
      !isNewCreateConversation
    ) {
      conversation.unread_count++;
    }
  }
  if (!uni_modules_uniIm_sdk_state_index.state.socketIsClose)
    ;
}));
exports.msgEvent = msgEvent;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/msgEvent.js.map
