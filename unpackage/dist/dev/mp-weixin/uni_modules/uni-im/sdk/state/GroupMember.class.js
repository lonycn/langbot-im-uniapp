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
const uni_modules_uniIm_sdk_state_GroupMemberItem_class = require("./GroupMemberItem.class.js");
const uni_modules_uniIm_sdk_methods_users = require("../methods/users.js");
require("./index.js");
const dbJQL = common_vendor.tr.databaseForJQL();
dbJQL.command;
dbJQL.command.aggregate;
class GroupMember extends uni_modules_uniIm_sdk_ext_CloudData_class.CloudData {
  constructor({ group_id } = {}) {
    super();
    this.group_id = group_id;
    this.indexKey = "users._id";
    this.needLoadOnce = true;
  }
  __beforeAdd(datas) {
    const userInfoObj = datas.reduce((obj, item) => {
      obj[item.users._id] = item.users;
      return obj;
    }, {});
    uni_modules_uniIm_sdk_methods_users.$users.merge(userInfoObj);
    return datas.map((item) => new uni_modules_uniIm_sdk_state_GroupMemberItem_class.GroupMemberItem(item));
  }
  findByUid(uid) {
    common_vendor.index.__f__("warn", "at uni_modules/uni-im/sdk/state/GroupMember.class.js:30", "member.findByUid 已经过期，去直接member.find(uid)查找");
    return this.dataList.find((item) => item.users._id === uid);
  }
  __beforeFind(param) {
    if (typeof param === "string") {
      return {
        users: {
          _id: param
        }
      };
    } else {
      return param;
    }
  }
  __get() {
    return __async(this, null, function* () {
      let _where = `"group_id" == "${this.group_id}"`;
      if (this.lastItem) {
        const { active_time, _id } = this.lastItem;
        _where += ` && !(role in ["admin"]) && ("active_time" < ${active_time} || ("active_time" == ${active_time} && "_id" < "${_id}"))`;
      }
      let res = yield dbJQL.collection(
        dbJQL.collection("uni-im-group-member").where(_where).orderBy("role desc,active_time desc,_id desc").limit(this.loadLimit).getTemp(),
        dbJQL.collection("uni-id-users").field("_id,nickname,avatar_file,realname_auth").getTemp()
      ).get();
      this.lastItem = res.data[res.data.length - 1];
      return res.data.map((item) => {
        const usersInfo = item.user_id[0];
        delete item.user_id;
        item.users = usersInfo;
        return item;
      });
    });
  }
}
exports.GroupMember = GroupMember;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/GroupMember.class.js.map
