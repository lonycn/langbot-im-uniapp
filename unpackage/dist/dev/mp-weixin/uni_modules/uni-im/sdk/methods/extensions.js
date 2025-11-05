"use strict";
require("../state/index.js");
let registeredExtensionPoints = {};
function installExt(extensionPointName, ext) {
  registeredExtensionPoints[extensionPointName] = registeredExtensionPoints[extensionPointName] || [];
  registeredExtensionPoints[extensionPointName].push(ext);
}
function hasExt(extensionPointName) {
  return registeredExtensionPoints[extensionPointName] && registeredExtensionPoints[extensionPointName].length > 0;
}
function invokeExts(extensionPointName, ...args) {
  if (!registeredExtensionPoints[extensionPointName])
    return [];
  let results = [];
  for (let ext of registeredExtensionPoints[extensionPointName]) {
    let result;
    if (typeof ext === "function") {
      result = ext.call(null, ...args);
    } else if (typeof ext === "object" && typeof ext.extension === "function") {
      result = ext.extension.call(ext, ...args);
    }
    results.push(result);
  }
  return results;
}
const $extensions = {
  installExt,
  hasExt,
  invokeExts
};
exports.$extensions = $extensions;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/methods/extensions.js.map
