"use strict";
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
const clearData = () => {
  uni_modules_uniIm_sdk_state_index.state.conversation.reset();
  uni_modules_uniIm_sdk_state_index.state.notification.reset();
  uni_modules_uniIm_sdk_state_index.state.friend.reset();
  uni_modules_uniIm_sdk_state_index.state.group.reset();
  uni_modules_uniIm_sdk_state_index.state.currentConversationId = false;
};
exports.clearData = clearData;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/clearData.js.map
