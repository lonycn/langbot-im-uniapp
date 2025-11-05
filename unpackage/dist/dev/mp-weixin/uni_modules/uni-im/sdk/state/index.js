"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_state_data = require("./data.js");
const observable = common_vendor.reactive(uni_modules_uniIm_sdk_state_data.data);
common_vendor.index.imObservableData = observable;
let lastKey = "";
common_vendor.watchEffect(() => {
  const conversationDataList = observable.conversation.dataList;
  const currentKey = sortConversationDataList(conversationDataList.slice()).map((item) => item.id).join(",");
  if (currentKey !== lastKey) {
    setTimeout(() => sortConversationDataList(conversationDataList), 0);
    lastKey = currentKey;
  }
});
common_vendor.watch(() => observable.currentConversationId, (currentConversationId, old) => {
  var _a, _b;
  if (old) {
    const oldConversation = observable.conversation.dataList.find((item) => item.id === old);
    const msgList = ((_a = oldConversation == null ? void 0 : oldConversation.msg) == null ? void 0 : _a.dataList) || [];
    const visibleDataList = ((_b = oldConversation == null ? void 0 : oldConversation.msg) == null ? void 0 : _b.visibleDataList()) || [];
    if (visibleDataList.length > 10) {
      const lastTenMsg = visibleDataList[visibleDataList.length - 10];
      const lastTenMsgIndex = msgList.findIndex((item) => item._id === lastTenMsg._id);
      oldConversation.msg.hasMore = true;
      for (let i = 0; i < lastTenMsgIndex; i++) {
        oldConversation.msg.dataMap.delete(msgList[i]._id);
      }
      msgList.splice(0, lastTenMsgIndex);
    }
  }
});
common_vendor.watch(() => observable.networkConnected, (networkConnected, oldNetworkConnected) => {
  if (oldNetworkConnected === false && networkConnected) {
    common_vendor.index.showModal({
      content: "运行期间网络连接被异常中断，请重新加载",
      showCancel: false,
      confirmText: "重新加载",
      success(e) {
        if (e.confirm) {
          window.location.reload();
        }
      }
    });
  }
});
function sortConversationDataList(conversationDataList) {
  return conversationDataList.sort(function(a, b) {
    if (a.pinned != b.pinned) {
      return a.pinned ? -1 : 1;
    }
    if (a.customIndex || b.customIndex) {
      let aIndex = a.customIndex || 0;
      let bIndex = b.customIndex || 0;
      return bIndex > aIndex ? 1 : -1;
    }
    if (b.time === a.time) {
      return b.id > a.id ? 1 : -1;
    }
    return b.time > a.time ? 1 : -1;
  });
}
const state = observable;
exports.state = state;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/index.js.map
