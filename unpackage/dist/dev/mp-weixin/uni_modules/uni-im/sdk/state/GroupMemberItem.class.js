"use strict";
const uni_modules_uniIm_sdk_state_index = require("./index.js");
class GroupMemberItem {
  constructor(data) {
    Object.assign(this, data);
    this.users = uni_modules_uniIm_sdk_state_index.state.users[this.users._id];
  }
}
exports.GroupMemberItem = GroupMemberItem;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/GroupMemberItem.class.js.map
