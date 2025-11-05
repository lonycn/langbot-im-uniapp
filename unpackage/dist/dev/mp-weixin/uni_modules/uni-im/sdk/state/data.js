"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIdPages_common_store = require("../../../uni-id-pages/common/store.js");
const uni_modules_uniIm_sdk_ext_CloudData_class = require("../ext/CloudData.class.js");
const uni_modules_uniIm_sdk_state_Conversation_class = require("./Conversation.class.js");
const uni_modules_uniIm_sdk_state_Group_class = require("./Group.class.js");
const uni_modules_uniIm_sdk_state_Friend_class = require("./Friend.class.js");
const data = {
  // 会话数据
  conversation: new uni_modules_uniIm_sdk_state_Conversation_class.Conversation(),
  // 好友列表
  friend: new uni_modules_uniIm_sdk_state_Friend_class.Friend(),
  // 群列表
  group: new uni_modules_uniIm_sdk_state_Group_class.Group(),
  // 系统通知消息
  notification: new uni_modules_uniIm_sdk_ext_CloudData_class.CloudData(),
  // 存储所有出现过的用户信息，包括群好友信息
  users: {},
  // 用户别名
  userAlias: {},
  // 当前用户信息
  currentUser: common_vendor.computed(() => {
    const { role, tokenExpired, permission } = common_vendor.tr.getCurrentUserInfo();
    return __spreadProps(__spreadValues({}, uni_modules_uniIdPages_common_store.store.userInfo), {
      role,
      tokenExpired,
      permission
    });
  }),
  // 是否禁用（用于全局禁用）
  isDisabled: false,
  // 正在对话的会话id
  currentConversationId: false,
  // 全局响应式心跳，用于更新消息距离当前时长 等
  heartbeat: "",
  //是否为pc宽屏
  isWidescreen: false,
  //是否为触摸屏
  isTouchable: false,
  //系统信息
  systemInfo: {},
  indexDB: false,
  audioContext: false,
  // sqlite数据库是否已经打开
  dataBaseIsOpen: false,
  socketIsClose: false,
  // 自由挂载任意自定义的全局响应式变量，特别用于nvue下跨页面通讯
  ext: {
    appIsActive: true,
    _initImData: {
      callbackList: [],
      isInit: false
    },
    _extensionPoints: {}
  }
};
exports.data = data;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/state/data.js.map
