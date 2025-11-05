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
const uni_modules_uniIm_sdk_methods_index = require("../methods/index.js");
const uni_modules_uniIm_sdk_utils_appEvent = require("./appEvent.js");
const uni_modules_uniIm_sdk_utils_toFriendlyTime = require("./toFriendlyTime.js");
const uni_modules_uniIm_sdk_utils_shortcutKey = require("./shortcut-key.js");
const uni_modules_uniIm_sdk_utils_htmlParser = require("./html-parser.js");
const uni_modules_uniIm_sdk_utils_markdownIt_min = require("./markdown-it.min.js");
const uni_modules_uniIm_sdk_utils_md5_min = require("./md5.min.js");
const utils = {
  appEvent: uni_modules_uniIm_sdk_utils_appEvent.appEvent,
  toFriendlyTime: uni_modules_uniIm_sdk_utils_toFriendlyTime.toFriendlyTime,
  shortcutKey: uni_modules_uniIm_sdk_utils_shortcutKey.shortcutKey,
  parseHtml: uni_modules_uniIm_sdk_utils_htmlParser.parseHtml,
  markdownIt: uni_modules_uniIm_sdk_utils_markdownIt_min.mt,
  /**
   *深度合并多个对象的方法
   */
  deepAssign() {
    let len = arguments.length, target = arguments[0];
    if (!this.isPlainObject(target)) {
      target = {};
    }
    for (let i = 1; i < len; i++) {
      let source = arguments[i];
      if (this.isPlainObject(source)) {
        for (let s in source) {
          if (s === "__proto__" || target === source[s]) {
            continue;
          }
          if (this.isPlainObject(source[s])) {
            target[s] = this.deepAssign(target[s], source[s]);
          } else {
            target[s] = source[s];
          }
        }
      }
    }
    return target;
  },
  /**
   * 替换文本中的url为套了html的a标签的方式
   */
  replaceUrlToLink(str) {
    let urlPattern = /(https?:\/\/|www\.)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
    return str.replace(urlPattern, function(match) {
      var href = match;
      if (match.indexOf("http") == -1) {
        href = "http://" + match;
      }
      return `<a class="link" target="_blank" href="${href}">${match}</a> `;
    });
  },
  /**
   *判断对象是否是一个纯粹的对象
   */
  isPlainObject(obj) {
    return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]";
  },
  getScreenMetrics() {
    let metrics = {
      pageLeft: 0,
      pageTop: 0,
      pageWidth: uni_modules_uniIm_sdk_state_index.state.systemInfo.screenWidth,
      pageHeight: uni_modules_uniIm_sdk_state_index.state.systemInfo.screenHeight
    };
    [
      "screenWidth",
      "screenHeight",
      "windowWidth",
      "windowHeight",
      "windowTop",
      "windowBottom",
      "statusBarHeight",
      "safeArea",
      "safeAreaInsets"
    ].forEach((name) => {
      metrics[name] = uni_modules_uniIm_sdk_state_index.state.systemInfo[name];
    });
    try {
      common_vendor.index.createSelectorQuery().select("uni-page-body > #page, uni-page-body > .page").boundingClientRect((data) => {
        if (data) {
          metrics["pageLeft"] = data.left;
          metrics["pageTop"] = data.top;
          metrics["pageWidth"] = data.width;
          metrics["pageHeight"] = data.height;
        }
      }).exec();
    } catch (e) {
      common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/utils/index.js:94", "调用 uni.createSelectorQuery 时机过早：", e);
    }
    return metrics;
  },
  isMuteMsg(msg) {
    return (
      // TODO：静默消息
      msg.is_mute === true || // 加群消息
      msg.action === "join-group" || // 禁言通知
      msg.action === "update-group-info-mute_all_members"
    );
  },
  isReadableMsg(msg) {
    var _a;
    let result = (_a = uni_modules_uniIm_sdk_methods_index.methods.msgTypes.get(msg.type)) == null ? void 0 : _a.isReadable();
    if (typeof result !== "undefined")
      return result;
    return msg.type !== "revoke_msg" && msg.action !== "update-group-info-avatar_file" && msg.action !== "set-group-member-ext-plugin-order-info" && msg.type !== "clear-conversation-unreadCount";
  },
  getMsgNote(_msg) {
    const msg = JSON.parse(JSON.stringify(_msg));
    const type = msg.type;
    let note = "[多媒体]";
    if (msg.is_revoke) {
      note = "消息已被撤回";
    } else if (msg.is_delete) {
      note = "消息已被删除";
    } else if (type === "text") {
      note = msg.body.toString();
    } else if (type === "userinfo-card") {
      note = `[${msg.body.name} 的名片]`;
    } else {
      note = {
        "image": "[图片]",
        "sound": "[语音]",
        "video": "[视频]",
        "file": "[文件]",
        "location": "[位置]",
        "system": "[系统通知]",
        "code": "[代码]",
        "rich-text": "[富文本消息]",
        "revoke_msg": "[消息已被撤回]",
        "history": "[转发的聊天记录]",
        "order": "[订单消息]",
        "pay-notify": "[支付成功通知]"
      }[type] || `[${type}]`;
      if (type == "system") {
        note = {
          "join-group": "[新用户加入群聊]",
          "group-exit": "[退出群聊]",
          "group-expel": "[被踢出群聊]",
          "group-dissolved": "[此群聊已被解散]",
          "setUnreadGroupNoticeId": "[群公告]"
        }[msg.action] || "[系统消息]";
      } else if (type == "rich-text") {
        let getRichTextText = function(nodesList) {
          return getTextNode(nodesList);
          function getTextNode(nodesList2) {
            let text = "";
            try {
              nodesList2.forEach((item) => {
                if (item.type == "text") {
                  text += item.text.replace(/(\r\n|\n|\r)/gm, "");
                } else {
                  text += {
                    "image": "[图片]",
                    "link": "[链接]"
                  }[item.type] || "";
                }
                if (item.name === "img") {
                  text += " [图片] ";
                }
                if (item.attrs && item.attrs.class === "nickname" && item.attrs.user_id) {
                  let userInfo = uni_modules_uniIm_sdk_state_index.state.users[item.attrs.user_id];
                  delete item.children;
                  if (userInfo) {
                    text += ` @${userInfo.nickname} `;
                  } else if (item.attrs.user_id === "__ALL") {
                    text += "[@所有人]";
                  } else {
                    text += "@" + uni_modules_uniIm_sdk_state_index.state.users.getNickname(item.attrs.user_id);
                  }
                }
                if (Array.isArray(item.children)) {
                  text += getTextNode(item.children);
                }
              });
            } catch (e) {
              common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/utils/index.js:194", "getRichTextText error", e);
            }
            return text || "";
          }
        };
        note = getRichTextText(msg.body);
      }
    }
    note = note.replace(/(\r\n|\n|\r)/gm, "");
    note = note.replace(/&nbsp;|&emsp;|&ensp;/g, " ");
    note = note.slice(0, 80).trim();
    return note;
  },
  // 节流执行函数，用于控制频繁触发的事件。
  throttle(fn, delay) {
    fn.timer && clearTimeout(fn.timer);
    fn.timer = setTimeout(fn, delay);
  },
  sleep(time) {
    return __async(this, null, function* () {
      return yield new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    });
  },
  getConversationId(id, type = "single") {
    if (type == "single") {
      let current_uid = uni_modules_uniIm_sdk_state_index.state.currentUser._id;
      if (!current_uid) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/utils/index.js:226", "错误current_uid不能为空", current_uid);
      }
      let param = [id, current_uid];
      return "single_" + uni_modules_uniIm_sdk_utils_md5_min.md5(param.sort().toString());
    } else {
      return "group_" + id;
    }
  },
  getTempFileURL(fileid) {
    return __async(this, null, function* () {
      if (!fileid || fileid.indexOf("blob:") === 0 || fileid.indexOf("data:image/png;base64,") === 0 || fileid.substring(0, 8) != "cloud://" && fileid.substring(0, 8) != "qiniu://") {
        return fileid;
      }
      try {
        let res = yield common_vendor.tr.getTempFileURL({
          fileList: [fileid]
        });
        return res.fileList[0].tempFileURL;
      } catch (e) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/utils/index.js:252", "getTempFileURL error", e);
      }
    });
  },
  openURL(href) {
    common_vendor.index.setClipboardData({
      data: href
    });
    common_vendor.index.showModal({
      content: "链接已复制到剪贴板，您可以粘贴到浏览器中打开",
      showCancel: false
    });
  },
  reportError(error) {
    return __async(this, null, function* () {
      var _a;
      const dbJQL = common_vendor.tr.databaseForJQL();
      let content = {
        stack: error.stack,
        message: error.message,
        code: error.code
      };
      content = JSON.stringify(content);
      const content_md5 = uni_modules_uniIm_sdk_utils_md5_min.md5(error.message);
      let res = yield dbJQL.collection("uni-im-error-log").where({
        user_id: uni_modules_uniIm_sdk_state_index.state.currentUser._id,
        content_md5
      }).get();
      if (res.data.length === 0) {
        res = yield dbJQL.collection("uni-im-error-log").add({
          content,
          content_md5
        });
      } else {
        res = yield dbJQL.collection("uni-im-error-log").where({
          _id: res.data[0]._id,
          user_id: uni_modules_uniIm_sdk_state_index.state.currentUser._id
        }).update({
          count: (((_a = res.data[0]) == null ? void 0 : _a.count) || 1) + 1
        });
      }
      common_vendor.index.__f__("warn", "at uni_modules/uni-im/sdk/utils/index.js:305", "【bug已上报】uni-im-sdk error has reported", res, { error });
    });
  },
  setTabBarBadge(index, unreadMsgCount) {
    if (uni_modules_uniIm_sdk_state_index.state.isWidescreen)
      return;
    try {
      if (unreadMsgCount == 0) {
        common_vendor.index.removeTabBarBadge({
          index,
          complete: (e) => {
          }
        });
      } else {
        common_vendor.index.setTabBarBadge({
          index,
          text: unreadMsgCount + "",
          complete: (e) => {
          }
        });
      }
    } catch (error) {
    }
  }
};
exports.utils = utils;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/utils/index.js.map
