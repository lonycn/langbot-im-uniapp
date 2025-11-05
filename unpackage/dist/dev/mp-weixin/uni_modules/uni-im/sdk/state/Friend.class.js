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
const uni_modules_uniIm_sdk_state_index = require("./index.js");
const dbJQL = common_vendor.tr.databaseForJQL();
dbJQL.command;
dbJQL.command.aggregate;
class Friend extends uni_modules_uniIm_sdk_ext_CloudData_class.CloudData {
  __beforeAdd(friendList) {
    friendList.forEach((item) => uni_modules_uniIm_sdk_state_index.state.users[item._id] = item);
    return friendList;
  }
  __get() {
    return __async(this, arguments, function* (param = {}) {
      const { friend_uid } = param;
      const limit = this.loadLimit;
      let whereString = '"user_id" == $cloudEnv_uid';
      if (friend_uid) {
        whereString += `&& "friend_uid" == "${friend_uid}"`;
      }
      let res = yield dbJQL.collection(
        dbJQL.collection("uni-im-friend").where(whereString).field("friend_uid,mark,class_name").getTemp(),
        dbJQL.collection("uni-id-users").field("_id,nickname,avatar_file,realname_auth").getTemp()
      ).limit(limit).get();
      const usersList = res.data.map((item) => item.friend_uid[0]);
      uni_modules_uniIm_sdk_state_index.state.users.merge(usersList.reduce((obj, item) => {
        obj[item._id] = item;
        return obj;
      }, {}));
      return usersList;
    });
  }
  remove(friend_uid) {
    let friendList = uni_modules_uniIm_sdk_state_index.state.friend.dataList;
    let index = friendList.findIndex((i) => i._id == friend_uid);
    friendList.splice(index, 1);
  }
}
exports.Friend = Friend;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/Friend.class.js.map
