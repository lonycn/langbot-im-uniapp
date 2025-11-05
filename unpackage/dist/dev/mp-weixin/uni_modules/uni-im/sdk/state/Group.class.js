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
const uni_modules_uniIm_sdk_ext_CloudData_class = require("../ext/CloudData.class.js");
const uni_modules_uniIm_sdk_state_GroupItem_class = require("./GroupItem.class.js");
require("./index.js");
const dbJQL = common_vendor.tr.databaseForJQL();
dbJQL.command;
dbJQL.command.aggregate;
class Group extends uni_modules_uniIm_sdk_ext_CloudData_class.CloudData {
  constructor() {
    super();
  }
  __beforeAdd(groupList) {
    if (!Array.isArray(groupList)) {
      groupList = [groupList];
    }
    return groupList.map((data) => new uni_modules_uniIm_sdk_state_GroupItem_class.GroupItem(data));
  }
  __get() {
    return __async(this, arguments, function* (param = {}) {
      const { group_id } = param;
      let whereString = '"user_id" == $cloudEnv_uid && "is_delete" != true';
      if (!this.min_create_time) {
        this.min_create_time = Date.now();
      }
      whereString += `&& "create_time" < ${this.min_create_time}`;
      if (group_id) {
        whereString += `&& "group_id" == "${group_id}"`;
      }
      const res = yield dbJQL.collection(
        dbJQL.collection("uni-im-group-member").where(whereString).orderBy("create_time", "desc").getTemp(),
        dbJQL.collection("uni-im-group").getTemp()
      ).limit(this.loadLimit).get();
      let groupList = res.data;
      const length = groupList.length;
      if (length) {
        this.min_create_time = groupList[length - 1].create_time;
      }
      groupList = groupList.map((item) => item.group_id[0]);
      return groupList;
    });
  }
}
exports.Group = Group;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/Group.class.js.map
