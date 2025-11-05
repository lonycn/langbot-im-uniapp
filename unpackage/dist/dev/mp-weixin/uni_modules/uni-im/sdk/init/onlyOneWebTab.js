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
const onlyOneWebTab = () => {
  if (!("BroadcastChannel" in window)) {
    return common_vendor.index.__f__("info", "at uni_modules/uni-im/sdk/init/onlyOneWebTab.js:6", "当前浏览器不支持BroadcastChannel");
  }
  const bc = new BroadcastChannel("uni-im-onlyOneWebTab");
  const msg = "Is there any other IM window available msgId:" + Math.random().toString(36).substring(7).padStart(12, "0");
  bc.postMessage(msg);
  bc.onmessage = (ev) => {
    if (ev.data.indexOf("Is there any other IM window available") === 0) {
      bc.postMessage("yes,about" + ev.data);
    } else if (ev.data === "yes,about" + msg) {
      common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onlyOneWebTab.js:18", "收到响应，说明当前浏览器其他选项卡已打开uni-im。通知其他关闭");
      bc.postMessage("please close");
    } else if (ev.data === "please close") {
      uni_modules_uniIm_sdk_state_index.state.indexDB.close();
      uni_modules_uniIm_sdk_state_index.state.isDisabled = true;
      setTimeout(() => {
        document.title = "uni-im（已掉线）";
      }, 1e3);
      common_vendor.index.showModal({
        title: "掉线提醒",
        content: "已在其他页面发起会话，当前页面已掉线",
        showCancel: false,
        confirmText: "重新连接",
        success: (res) => __async(exports, null, function* () {
          if (res.confirm) {
            bc.postMessage("please close");
            location.reload();
          }
        }),
        fail: function(res) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/init/onlyOneWebTab.js:44", res.errMsg);
        }
      });
    }
  };
};
exports.onlyOneWebTab = onlyOneWebTab;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/onlyOneWebTab.js.map
