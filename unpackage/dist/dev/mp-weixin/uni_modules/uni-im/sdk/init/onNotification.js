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
const current_uid = uni_modules_uniIm_sdk_state_index.state.currentUser._id;
const onNotification = (res) => {
  var _b, _c;
  res.data.create_time = Date.now();
  res.data.is_read = res.data.is_read || false;
  common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onNotification.js:6", "res.data notification.add", res.data);
  res.data._id = res.data.payload.notificationId;
  const notificationData = res.data;
  delete res.data.payload.notificationId;
  delete res.data.unipush_version;
  uni_modules_uniIm_sdk_state_index.state.notification.add(res.data);
  const { data } = (notificationData == null ? void 0 : notificationData.payload) || {};
  const actions = {
    "uni-im-friend-delete"() {
      const friend_uid = data.from_uid == current_uid ? data.to_uid : data.from_uid;
      uni_modules_uniIm_sdk_state_index.state.friend.remove(friend_uid);
    },
    "uni-im-friend-add"() {
      return __async(this, null, function* () {
        const friend_uid = data.from_uid == current_uid ? data.to_uid : data.from_uid;
        let friendInfo = yield uni_modules_uniIm_sdk_state_index.state.users.get(friend_uid);
        common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onNotification.js:21", "friendInfo", friendInfo);
        uni_modules_uniIm_sdk_state_index.state.friend.add(friendInfo);
      });
    }
  };
  try {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onNotification.js:27", 777, (_b = notificationData == null ? void 0 : notificationData.payload) == null ? void 0 : _b.subType, notificationData);
    const action = actions[(_c = notificationData == null ? void 0 : notificationData.payload) == null ? void 0 : _c.subType];
    action && action();
  } catch (e) {
    common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/onNotification.js:31", e, notificationData);
  }
};
exports.onNotification = onNotification;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/onNotification.js.map
