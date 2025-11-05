"use strict";
const common_vendor = require("../../../../common/vendor.js");
const checkVersion = (version) => {
  const lastVersion = common_vendor.index.getStorageSync("uni-im-storage-version");
  if (lastVersion != version) {
    const storageKeys = common_vendor.index.getStorageInfoSync().keys;
    storageKeys.forEach((key) => {
      if (key.indexOf("uni-im") === 0) {
        common_vendor.index.removeStorageSync(key);
      }
    });
    common_vendor.index.setStorageSync("uni-im-storage-version", version);
  }
};
exports.checkVersion = checkVersion;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/init/checkVersion.js.map
