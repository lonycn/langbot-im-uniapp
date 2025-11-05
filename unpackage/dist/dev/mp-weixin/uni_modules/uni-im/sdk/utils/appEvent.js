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
function implEvent(name) {
  let cbs = `_callbacks_${name}`;
  return {
    [cbs]: [],
    [`on${name}`]: function(callback) {
      this[cbs].push(callback);
    },
    [`off${name}`]: function(callback) {
      this[cbs] = this[cbs].filter((cb) => cb !== callback);
    },
    [`emit${name}`]: function(...args) {
      for (let cb of this[cbs]) {
        cb.call(null, ...args);
      }
    }
  };
}
const appEvent = __spreadProps(__spreadValues(__spreadValues({}, implEvent("AppActivate")), implEvent("AppDeactivate")), {
  callbacks_KeyDown: [],
  onKeyDown(callback, { order = 0, match = {} } = {}) {
    this["callbacks_KeyDown"].push({
      callback,
      order,
      match
    });
    this["callbacks_KeyDown"].sort((a, b) => a.order - b.order);
  },
  offKeyDown(callback) {
    this.callbacks_KeyDown = this.callbacks_KeyDown.filter((v) => v.callback !== callback);
  },
  emitKeyDown(evt) {
    for (let v of this.callbacks_KeyDown) {
      let matched = Object.keys(v.match).reduce((matched2, name) => {
        return matched2 && evt[name] === v.match[name];
      }, true);
      if (!matched)
        continue;
      let res = v.callback.call(null, evt);
      if (res === true)
        break;
    }
  }
});
setTimeout(() => {
  common_vendor.index.onAppShow(function() {
    appEvent.emitAppActivate();
  });
  common_vendor.index.onAppHide(function() {
    appEvent.emitAppDeactivate();
  });
}, 0);
exports.appEvent = appEvent;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/utils/appEvent.js.map
