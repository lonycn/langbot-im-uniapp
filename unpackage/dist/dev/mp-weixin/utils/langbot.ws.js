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
const common_vendor = require("../common/vendor.js");
const DEFAULT_OPTIONS = {
  url: "",
  userId: "",
  convId: "c_langbot",
  getAuthToken: () => "",
  reconnect: true,
  maxRetries: 6,
  retryInterval: 1e3,
  onOpen: null,
  onClose: null,
  onError: null,
  onStatusChange: null
};
let socket = null;
let listeners = /* @__PURE__ */ new Set();
let connectionOptions = __spreadValues({}, DEFAULT_OPTIONS);
let reconnectAttempts = 0;
let reconnectTimer = null;
let manualClose = false;
function notifyStatus(status) {
  if (typeof connectionOptions.onStatusChange === "function") {
    try {
      connectionOptions.onStatusChange(status);
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/langbot.ws.js:27", "[langbot.ws] onStatusChange callback error", error);
    }
  }
}
function buildInitPayload() {
  const authToken = typeof connectionOptions.getAuthToken === "function" ? connectionOptions.getAuthToken() : connectionOptions.getAuthToken;
  const payload = {
    type: "init",
    user_id: connectionOptions.userId,
    conv_id: connectionOptions.convId
  };
  if (authToken) {
    payload.auth = { token: authToken };
  }
  return payload;
}
function configureWS(options = {}) {
  connectionOptions = __spreadValues(__spreadValues({}, connectionOptions), options);
}
function connectWS(options = {}) {
  if (socket && typeof socket.readyState !== "undefined" && socket.readyState !== 3) {
    return;
  }
  connectionOptions = __spreadValues(__spreadValues({}, connectionOptions), options);
  if (!connectionOptions.url || !connectionOptions.userId) {
    common_vendor.index.__f__("warn", "at utils/langbot.ws.js:62", "[langbot.ws] url and userId must be provided before connecting.");
    return;
  }
  manualClose = false;
  clearReconnectTimer();
  notifyStatus("connecting");
  socket = common_vendor.index.connectSocket({
    url: connectionOptions.url,
    complete: () => {
    }
  });
  socket.onOpen(() => {
    reconnectAttempts = 0;
    notifyStatus("connected");
    socket.send({ data: JSON.stringify(buildInitPayload()) });
    if (typeof connectionOptions.onOpen === "function") {
      try {
        connectionOptions.onOpen();
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/langbot.ws.js:83", "[langbot.ws] onOpen callback error", error);
      }
    }
  });
  socket.onMessage((event) => {
    let data = event.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (error) {
        common_vendor.index.__f__("warn", "at utils/langbot.ws.js:94", "[langbot.ws] Failed to parse message", error);
      }
    }
    listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/langbot.ws.js:102", "[langbot.ws] listener thrown error", error);
      }
    });
  });
  socket.onClose(() => {
    socket = null;
    notifyStatus(manualClose ? "closed" : "reconnecting");
    if (typeof connectionOptions.onClose === "function") {
      try {
        connectionOptions.onClose();
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/langbot.ws.js:114", "[langbot.ws] onClose callback error", error);
      }
    }
    if (!manualClose && connectionOptions.reconnect) {
      scheduleReconnect();
    }
  });
  socket.onError((error) => {
    notifyStatus("error");
    if (typeof connectionOptions.onError === "function") {
      try {
        connectionOptions.onError(error);
      } catch (callbackError) {
        common_vendor.index.__f__("error", "at utils/langbot.ws.js:128", "[langbot.ws] onError callback error", callbackError);
      }
    }
    if (socket) {
      socket.close();
    }
  });
}
function onWSMessage(listener) {
  if (typeof listener === "function") {
    listeners.add(listener);
  }
  return () => {
    listeners.delete(listener);
  };
}
function sendWSMessage(payload) {
  if (!socket) {
    common_vendor.index.__f__("warn", "at utils/langbot.ws.js:148", "[langbot.ws] socket not connected, message dropped");
    return;
  }
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  socket.send({ data });
}
function closeWS() {
  manualClose = true;
  clearReconnectTimer();
  if (socket) {
    socket.close();
    socket = null;
  }
}
function scheduleReconnect() {
  reconnectAttempts += 1;
  if (reconnectAttempts > connectionOptions.maxRetries) {
    common_vendor.index.__f__("warn", "at utils/langbot.ws.js:168", "[langbot.ws] reached max reconnect attempts");
    return;
  }
  const baseDelay = connectionOptions.retryInterval * Math.pow(2, reconnectAttempts - 1);
  const jitter = Math.random() * baseDelay * 0.3;
  const delay = Math.min(baseDelay + jitter, 3e4);
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    connectWS();
  }, delay);
}
function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
exports.closeWS = closeWS;
exports.configureWS = configureWS;
exports.connectWS = connectWS;
exports.onWSMessage = onWSMessage;
exports.sendWSMessage = sendWSMessage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/langbot.ws.js.map
