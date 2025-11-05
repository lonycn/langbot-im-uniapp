"use strict";
const common_vendor = require("../common/vendor.js");
const TOKEN_KEY = "langbot_token";
const USER_ID_KEY = "langbot_user_id";
function getToken() {
  try {
    return common_vendor.index.getStorageSync(TOKEN_KEY) || "";
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.js:8", "[auth] getToken failed", error);
    return "";
  }
}
function setToken(token) {
  try {
    if (token) {
      common_vendor.index.setStorageSync(TOKEN_KEY, token);
    } else {
      common_vendor.index.removeStorageSync(TOKEN_KEY);
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.js:21", "[auth] setToken failed", error);
  }
}
function getUserId() {
  try {
    return common_vendor.index.getStorageSync(USER_ID_KEY) || "";
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.js:33", "[auth] getUserId failed", error);
    return "";
  }
}
function setUserId(userId) {
  try {
    if (userId) {
      common_vendor.index.setStorageSync(USER_ID_KEY, userId);
    } else {
      common_vendor.index.removeStorageSync(USER_ID_KEY);
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.js:46", "[auth] setUserId failed", error);
  }
}
exports.getToken = getToken;
exports.getUserId = getUserId;
exports.setToken = setToken;
exports.setUserId = setUserId;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
