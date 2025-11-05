"use strict";
function toFriendlyTime(timestamp, h12 = false) {
  const now = /* @__PURE__ */ new Date();
  const date = new Date(timestamp);
  if (date > now + 1e3 * 30) {
    return "未来";
  }
  const todayBegin = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
  const ampm = h12 ? date.getHours() >= 12 ? "下午 " : "上午 " : "";
  const hour = h12 ? date.getHours() % 12 : date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  if (timestamp >= todayBegin) {
    const secondsAgo = Math.floor((now - date) / 1e3);
    if (secondsAgo < 60) {
      return "刚刚";
    }
    if (secondsAgo < 60 * 60) {
      const minutes = Math.floor(secondsAgo / 60);
      return `${minutes}分钟前`;
    }
    if (secondsAgo < 60 * 60 * 2) {
      const hours = Math.floor(secondsAgo / (60 * 60));
      const minutes = Math.floor((secondsAgo - hours * 60 * 60) / 60);
      if (minutes) {
        return `${hours}小时 ${minutes}分钟前`;
      } else {
        return `${hours}小时前`;
      }
    }
    return `${ampm}${hour}:${minute}`;
  }
  if (timestamp >= todayBegin - 1e3 * 60 * 60 * 24) {
    return `昨天 ${ampm}${hour}:${minute}`;
  }
  if (timestamp >= todayBegin - 1e3 * 60 * 60 * 48) {
    return `前天 ${ampm}${hour}:${minute}`;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const yearBegin = (/* @__PURE__ */ new Date()).setMonth(0, 0);
  if (timestamp >= yearBegin) {
    const firstDayOfWeek = /* @__PURE__ */ new Date();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
    const weekBegin = firstDayOfWeek.setHours(0, 0, 0, 0);
    if (timestamp >= weekBegin) {
      const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      return `${days[date.getDay()]} ${ampm}${hour}:${minute}`;
    }
    return `${month}/${day} ${ampm}${hour}:${minute}`;
  }
  return `${year}/${month}/${day} ${ampm}${hour}:${minute}`;
}
exports.toFriendlyTime = toFriendlyTime;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/utils/toFriendlyTime.js.map
