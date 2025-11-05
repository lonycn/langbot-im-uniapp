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
require("./getCloudMsg.js");
const uni_modules_uniIm_sdk_state_index = require("../state/index.js");
const uni_modules_uniIm_sdk_methods_index = require("../methods/index.js");
const uni_modules_uniIm_sdk_init_clearData = require("./clearData.js");
const imData = {
  onInitAfter(callback) {
    if (uni_modules_uniIm_sdk_state_index.state.ext._initImData.isInit) {
      callback();
    } else {
      uni_modules_uniIm_sdk_state_index.state.ext._initImData.callbackList.push(callback);
    }
  },
  init() {
    return __async(this, null, function* () {
      uni_modules_uniIm_sdk_init_clearData.clearData();
      let storageConversationList = [];
      if (storageConversationList.length) {
        uni_modules_uniIm_sdk_state_index.state.conversation.add(storageConversationList);
      }
      uni_modules_uniIm_sdk_state_index.state.ext._initImData.isInit = true;
      uni_modules_uniIm_sdk_state_index.state.ext._initImData.callbackList.forEach((fn) => {
        fn();
      });
      uni_modules_uniIm_sdk_state_index.state.notification.loadMore();
      uni_modules_uniIm_sdk_state_index.state.friend.loadMore();
      uni_modules_uniIm_sdk_state_index.state.group.loadMore();
      const user_id = uni_modules_uniIm_sdk_state_index.state.currentUser._id;
      if (user_id) {
        uni_modules_uniIm_sdk_state_index.state.users.merge({
          [user_id]: uni_modules_uniIm_sdk_state_index.state.currentUser
        });
      }
      const db = common_vendor.tr.databaseForJQL();
      db.collection("uni-im-user-alias").where("user_id == $cloudEnv_uid").limit(1e3).get().then((res) => {
        uni_modules_uniIm_sdk_state_index.state.userAlias = res.data.reduce((aliasMap, item) => {
          aliasMap[item.target_uid] = item.content;
          return aliasMap;
        }, {});
      }).catch((err) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/init/imData.js:155", "获取用户别名失败", err);
      });
    });
  }
};
uni_modules_uniIm_sdk_methods_index.methods.onInitDataAfter = imData.onInitAfter;
exports.imData = imData;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/imData.js.map
