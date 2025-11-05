"use strict";
const uni_modules_uniIm_sdk_state_GroupMember_class = require("./GroupMember.class.js");
class GroupItem {
  constructor(data) {
    for (let key in data) {
      this[key] = data[key];
    }
    this.member = new uni_modules_uniIm_sdk_state_GroupMember_class.GroupMember({ group_id: this._id });
  }
}
exports.GroupItem = GroupItem;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/GroupItem.class.js.map
