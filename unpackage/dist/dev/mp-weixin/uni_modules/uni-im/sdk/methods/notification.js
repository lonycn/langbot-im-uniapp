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
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const db = common_vendor.tr.database();
const notification = {
  get: ({
    type,
    excludeType
  } = {}) => {
    const notificationDatas = uni_modules_uniIm_sdk_state_index.state.notification.dataList;
    if (notificationDatas) {
      return notificationDatas.reduce((sum, item) => {
        if (type) {
          typeof type == "string" ? type = [type] : "";
          if (type.includes(item.payload.subType)) {
            sum.push(item);
          }
        } else if (excludeType) {
          typeof excludeType == "string" ? excludeType = [excludeType] : "";
          if (!excludeType.includes(item.payload.subType)) {
            sum.push(item);
          }
        } else {
          sum.push(item);
        }
        return sum;
      }, []);
    } else {
      return false;
    }
  },
  loadMore() {
    return __async(this, null, function* () {
      let res = yield db.collection("uni-im-notification").aggregate().match('"payload.type" == "uni-im-notification" && "user_id" == $cloudEnv_uid').sort({
        create_time: -1
      }).limit(1e3).end();
      this.add(res.result.data);
      this.hasMore == (res.result.data.length != 0);
    });
  },
  add(datas) {
    if (!Array.isArray(datas)) {
      datas = [datas];
    }
    let notificationDatas = datas.concat(uni_modules_uniIm_sdk_state_index.state.notification.dataList);
    notificationDatas.sort((a, b) => a.create_time - b.create_time);
    let obj = {};
    for (var i = 0; i < notificationDatas.length; i++) {
      let item = notificationDatas[i];
      let {
        subType,
        unique
      } = item.payload;
      obj[unique ? subType + "_" + unique : Date.now() + "_" + i] = item;
    }
    let dataList = [];
    for (let key in obj) {
      let item = obj[key];
      dataList.push(item);
    }
    dataList.sort((a, b) => b.create_time - a.create_time);
    uni_modules_uniIm_sdk_state_index.state.notification.dataList = dataList;
  },
  unreadCount(param = {}) {
    let notificationDatas = this.get(param);
    let unreadCount = notificationDatas.reduce((sum, item, index, array) => {
      if (!item.is_read) {
        sum++;
      }
      return sum;
    }, 0);
    uni_modules_uniIm_sdk_utils_index.utils.setTabBarBadge(2, unreadCount);
    if (unreadCount) {
      return unreadCount + "";
    } else {
      return "";
    }
  }
};
exports.notification = notification;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/methods/notification.js.map
