"use strict";
require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_utils_md5_min = require("../utils/md5.min.js");
const uni_modules_uniIm_sdk_state_index = require("./index.js");
const __updateAfterTimer = {};
class MsgItem {
  constructor(msgData) {
    for (let key in msgData) {
      this[key] = msgData[key];
    }
    const { create_time, client_create_time } = msgData;
    this.unique_id = "u" + (create_time || client_create_time).toString(36) + uni_modules_uniIm_sdk_utils_md5_min.md5(JSON.stringify(msgData));
  }
  __updateAfter() {
    if (__updateAfterTimer[this.unique_id]) {
      clearTimeout(__updateAfterTimer[this.unique_id]);
    }
    __updateAfterTimer[this.unique_id] = setTimeout(() => {
      const { conversation_id, _id } = this;
      if (_id) {
        const conversation = uni_modules_uniIm_sdk_state_index.state.conversation.find({ conversation_id });
        if (conversation) {
          conversation.msg.dataMap.set(_id, this);
        }
      }
      return;
    }, 100);
  }
}
exports.MsgItem = MsgItem;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/MsgItem.class.js.map
