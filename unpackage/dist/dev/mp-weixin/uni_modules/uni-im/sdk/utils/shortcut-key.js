"use strict";
let ctrlKeydown = false;
function withCtrl(callback) {
  document.addEventListener("keydown", function(e) {
    if (e.key == "Control") {
      ctrlKeydown = true;
    }
    if (ctrlKeydown) {
      callback(e.key);
    }
  });
  document.addEventListener("keyup", function(e) {
    if (e.key == "Control") {
      ctrlKeydown = false;
    }
  });
}
let metaKeydown = false;
function withMeta(callback) {
  document.addEventListener("keydown", function(e) {
    if (e.key == "Meta") {
      metaKeydown = true;
    }
    if (metaKeydown) {
      callback(e.key, e);
    }
  });
  document.addEventListener("keyup", function(e) {
    if (e.key == "Meta") {
      metaKeydown = false;
    }
  });
}
const shortcutKey = { withCtrl, withMeta };
exports.shortcutKey = shortcutKey;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/utils/shortcut-key.js.map
