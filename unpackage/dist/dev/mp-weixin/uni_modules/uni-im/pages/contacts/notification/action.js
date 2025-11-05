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
const common_vendor = require("../../../../../common/vendor.js");
const db = common_vendor.tr.database();
function action(_0, _1) {
  return __async(this, arguments, function* ({
    subType,
    confirm,
    cancel,
    item
  }, callback) {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/action.js:8", {
      subType,
      confirm,
      cancel,
      item
    });
    switch (subType) {
      case "uni-im-friend-invite":
        common_vendor.index.showLoading({
          mask: false
        });
        return db.collection("uni-im-friend-invite").doc(item.payload.data._id).update({
          state: confirm ? 100 : -100
        }).then((res) => {
          common_vendor.index.hideLoading();
          callback();
        }).catch((err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/action.js:28", err);
          common_vendor.index.showModal({
            content: err.message || "请求服务失败",
            showCancel: false
          });
        });
      case "uni-im-group-join-request":
        common_vendor.index.showLoading({
          mask: false
        });
        yield db.collection("uni-im-group-join").where({
          _id: item.payload.data.doc_id
        }).update({
          state: confirm ? 100 : -100
        }).then((res) => {
          callback();
        }).catch((err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/action.js:49", err);
          common_vendor.index.showModal({
            content: err.message || "请求服务失败",
            showCancel: false
          });
        }).finally(() => {
          common_vendor.index.hideLoading();
        });
        break;
      default:
        common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/contacts/notification/action.js:60", { subType });
        break;
    }
  });
}
exports.action = action;
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/notification/action.js.map
