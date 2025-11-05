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
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
const uniImCo = common_vendor.tr.importObject("uni-im-co", {
  customUI: false
});
const dbJQL = common_vendor.tr.databaseForJQL();
let getCloudMsgIng = false;
function getCloudMsg({
  loadingTitle,
  callback
} = {
  "callback": () => {
  }
}) {
  if (uni_modules_uniIm_sdk_state_index.state.isDisabled) {
    return common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:16", "$state isDisabled");
  }
  if (getCloudMsgIng) {
    callback();
    return;
  }
  getCloudMsgIng = true;
  if (loadingTitle) {
    common_vendor.index.showLoading({
      title: loadingTitle,
      mask: true
    });
  }
  setTimeout(() => __async(this, null, function* () {
    try {
      yield getConversationList();
      function getConversationList() {
        return __async(this, null, function* () {
          let maxConversation = [...uni_modules_uniIm_sdk_state_index.state.conversation.dataList].sort((a, b) => b.update_time - a.update_time)[0];
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:41", "maxConversation:", maxConversation);
          if (!maxConversation) {
            getCloudMsgIng = false;
            return;
          }
          let minUpdateTime = maxConversation.update_time;
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:49", "getCloudMsg");
          let { data: conversationDatas } = yield uniImCo.getConversationList({
            minUpdateTime,
            limit: 30
          });
          conversationDatas.forEach((newConversationInfo) => {
            const conversation = uni_modules_uniIm_sdk_state_index.state.conversation.set(newConversationInfo);
            if (uni_modules_uniIm_sdk_state_index.state.currentConversationId === conversation.id) {
              conversation.unread_count = 0;
            }
          });
          for (let i = 0; i < conversationDatas.length; i++) {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:68", "需要查询的msg有：" + conversationDatas.length, i);
            const conversation = conversationDatas[i];
            yield getConversationMsgs({ conversation, minUpdateTime });
          }
          if (conversationDatas.length === 30) {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:78", "可能存在下一页数据");
            return yield getConversationList();
          } else {
            common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:81", "离线会话数据同步完毕");
          }
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:83", `更新会话：${conversationDatas.length}`);
        });
      }
      getCloudMsgIng = false;
      callback();
      if (loadingTitle) {
        common_vendor.index.hideLoading();
      }
    } catch (e) {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:91", "getCloudMsg error", e);
      getCloudMsgIng = false;
    }
  }), 0);
}
function seaveMsgs(msgs) {
  return __async(this, null, function* () {
    if (msgs.length === 0) {
      return;
    }
    const conversation = uni_modules_uniIm_sdk_state_index.state.conversation.find(msgs[0].conversation_id);
    msgs.forEach((msg) => {
      if (conversation.isInit) {
        let hasThisMsg = conversation.msg.find(msg._id);
        if (hasThisMsg) {
          Object.assign(hasThisMsg, msg);
        } else {
          conversation.msg.add(msg);
        }
      }
    });
  });
}
function getConversationMsgs(_0) {
  return __async(this, arguments, function* ({
    limit = 100,
    conversation,
    minUpdateTime = 0
  }) {
    const conversation_id = conversation.id;
    let res = yield dbJQL.collection("uni-im-msg").where({
      conversation_id,
      "update_time": dbJQL.command.gt(minUpdateTime)
    }).orderBy("update_time", "asc").limit(limit).get();
    common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/getCloudMsg.js:165", "查询到新msg数据", res, res.data.length);
    seaveMsgs(res.data);
    if (res.data.length === limit) {
      arguments[0].minUpdateTime = res.data[limit - 1].update_time;
      yield getConversationMsgs(arguments[0]);
    }
  });
}
exports.getCloudMsg = getCloudMsg;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/getCloudMsg.js.map
