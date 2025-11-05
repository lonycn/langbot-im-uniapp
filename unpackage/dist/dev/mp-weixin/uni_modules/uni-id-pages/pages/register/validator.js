"use strict";
var __defProp = Object.defineProperty;
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
const uni_modules_uniIdPages_common_password = require("../../common/password.js");
const rules = __spreadValues({
  "username": {
    "rules": [
      {
        required: true,
        errorMessage: "请输入用户名"
      },
      {
        minLength: 3,
        maxLength: 32,
        errorMessage: "用户名长度在 {minLength} 到 {maxLength} 个字符"
      },
      {
        validateFunction: function(rule, value, data, callback) {
          if (/^1\d{10}$/.test(value) || /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(value)) {
            callback("用户名不能是：手机号或邮箱");
          }
          if (/^\d+$/.test(value)) {
            callback("用户名不能为纯数字");
          }
          if (/[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/.test(value)) {
            callback("用户名不能包含中文");
          }
          return true;
        }
      }
    ],
    "label": "用户名"
  },
  "nickname": {
    "rules": [
      {
        required: true,
        errorMessage: "uni-im项目用户，必须要有昵称"
      },
      {
        minLength: 3,
        maxLength: 32,
        errorMessage: "昵称长度在 {minLength} 到 {maxLength} 个字符"
      },
      {
        validateFunction: function(rule, value, data, callback) {
          if (/^1\d{10}$/.test(value) || /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(value)) {
            callback("昵称不能是：手机号或邮箱");
          }
          if (/^\d+$/.test(value)) {
            callback("昵称不能为纯数字");
          }
          if (/[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/.test(value)) {
            callback("昵称不能包含中文");
          }
          return true;
        }
      }
    ],
    "label": "昵称"
  }
}, uni_modules_uniIdPages_common_password.passwordMod.getPwdRules());
exports.rules = rules;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-id-pages/pages/register/validator.js.map
