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
const common_vendor = require("../../common/vendor.js");
const utils_langbot_ws = require("../../utils/langbot.ws.js");
const utils_langbot_http = require("../../utils/langbot.http.js");
const utils_auth = require("../../utils/auth.js");
if (!Math) {
  (MsgText + MsgCard + MsgImage + MsgAudio + MsgVideo + MsgFile + MsgWidget)();
}
const MsgText = () => "../../components/MsgText.js";
const MsgCard = () => "../../components/MsgCard.js";
const MsgImage = () => "../../components/MsgImage.js";
const MsgAudio = () => "../../components/MsgAudio.js";
const MsgVideo = () => "../../components/MsgVideo.js";
const MsgFile = () => "../../components/MsgFile.js";
const MsgWidget = () => "../../components/MsgWidget.js";
const HISTORY_STORAGE_KEY = "langbot_chat_history";
const MAX_HISTORY_LENGTH = 100;
const _sfc_main = {
  __name: "chat",
  setup(__props) {
    const defaultWsURL = common_vendor.index.getStorageSync("langbot_ws_url") || "ws://127.0.0.1:8765";
    const defaultHttpURL = common_vendor.index.getStorageSync("langbot_http_base") || "http://127.0.0.1:8080";
    const config = common_vendor.reactive({
      wsUrl: defaultWsURL,
      httpUrl: defaultHttpURL
    });
    const wsUrlInput = common_vendor.ref(config.wsUrl);
    const httpUrlInput = common_vendor.ref(config.httpUrl);
    const settingsVisible = common_vendor.ref(false);
    const userId = common_vendor.ref(utils_auth.getUserId() || `guest_${Date.now()}`);
    if (!utils_auth.getUserId()) {
      utils_auth.setUserId(userId.value);
    }
    const convId = common_vendor.ref("c_langbot");
    const messages = common_vendor.ref([]);
    const inputText = common_vendor.ref("");
    const systemTip = common_vendor.ref("");
    const scrollAnchor = common_vendor.ref("");
    const connectionStatus = common_vendor.ref("connecting");
    const activeStreamId = common_vendor.ref(null);
    let unsubscribeWS = null;
    const statusLabel = common_vendor.computed(() => {
      switch (connectionStatus.value) {
        case "connected":
          return "已连接";
        case "reconnecting":
          return "重连中...";
        case "error":
          return "连接异常";
        case "closed":
          return "已断开";
        default:
          return "连接中...";
      }
    });
    function loadHistory() {
      try {
        const raw = common_vendor.index.getStorageSync(HISTORY_STORAGE_KEY);
        if (!raw)
          return;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          messages.value = data.map((item) => normalizeMessage(item));
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/chat/chat.vue:132", "[chat] load history failed", error);
      }
    }
    function persistHistory() {
      try {
        const snapshot = messages.value.slice(-MAX_HISTORY_LENGTH);
        common_vendor.index.setStorageSync(HISTORY_STORAGE_KEY, JSON.stringify(snapshot));
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/chat/chat.vue:141", "[chat] persist history failed", error);
      }
    }
    function normalizeMessage(payload = {}) {
      var _a, _b, _c, _d, _e, _f, _g;
      return {
        id: payload.id || `msg-${Date.now()}`,
        from: payload.from || "bot",
        msg_type: payload.msg_type || "text",
        text: typeof payload.text === "string" ? payload.text : "",
        card: (_a = payload.card) != null ? _a : null,
        image: (_b = payload.image) != null ? _b : null,
        audio: (_c = payload.audio) != null ? _c : null,
        video: (_d = payload.video) != null ? _d : null,
        file: (_e = payload.file) != null ? _e : null,
        widget: (_f = payload.widget) != null ? _f : null,
        media: (_g = payload.media) != null ? _g : null,
        meta: __spreadValues({}, payload.meta || {}),
        ts: payload.ts || Date.now(),
        streaming: !!payload.streaming
      };
    }
    function appendMessage(payload = {}) {
      const record = normalizeMessage(payload);
      messages.value.push(record);
      trimMessages();
      persistHistory();
      scrollToBottom();
      return record.id;
    }
    function updateMessage(id, patch = {}) {
      const index = messages.value.findIndex((msg) => msg.id === id);
      const base = index !== -1 ? messages.value[index] : normalizeMessage({ id });
      const merged = normalizeMessage(__spreadProps(__spreadValues(__spreadValues({}, base), patch), {
        card: patch.card !== void 0 ? patch.card : base.card,
        image: patch.image !== void 0 ? patch.image : base.image,
        audio: patch.audio !== void 0 ? patch.audio : base.audio,
        video: patch.video !== void 0 ? patch.video : base.video,
        file: patch.file !== void 0 ? patch.file : base.file,
        widget: patch.widget !== void 0 ? patch.widget : base.widget,
        media: patch.media !== void 0 ? patch.media : base.media,
        meta: __spreadValues(__spreadValues({}, base.meta || {}), patch.meta || {}),
        ts: patch.ts || base.ts,
        streaming: patch.streaming !== void 0 ? !!patch.streaming : base.streaming
      }));
      if (index === -1) {
        messages.value.push(merged);
      } else {
        messages.value.splice(index, 1, merged);
      }
      trimMessages();
      persistHistory();
      scrollToBottom();
      return merged;
    }
    function trimMessages() {
      if (messages.value.length > MAX_HISTORY_LENGTH) {
        const overflow = messages.value.length - MAX_HISTORY_LENGTH;
        messages.value.splice(0, overflow);
      }
    }
    function scrollToBottom() {
      common_vendor.nextTick$1(() => {
        scrollAnchor.value = `msg-${messages.value.length - 1}`;
      });
    }
    function initNetwork() {
      utils_langbot_http.configureHttp({
        baseURL: config.httpUrl,
        getAuthToken: utils_auth.getToken
      });
      utils_langbot_ws.configureWS({
        url: config.wsUrl,
        userId: userId.value,
        convId: convId.value,
        getAuthToken: utils_auth.getToken,
        onOpen: () => {
          activeStreamId.value = null;
          systemTip.value = "已连接 LangBot Adapter";
        },
        onClose: () => {
          systemTip.value = "连接断开，正在尝试重连...";
        },
        onError: () => {
          systemTip.value = "连接异常，请检查配置或稍后再试";
        },
        onStatusChange: (status) => {
          connectionStatus.value = status;
          if (status === "connecting") {
            systemTip.value = "正在连接 LangBot Adapter...";
          } else if (status === "reconnecting") {
            systemTip.value = "连接断开，正在尝试重连...";
          } else if (status === "closed") {
            systemTip.value = "连接已关闭";
          }
        }
      });
      utils_langbot_ws.connectWS();
      if (typeof unsubscribeWS === "function") {
        unsubscribeWS();
      }
      unsubscribeWS = utils_langbot_ws.onWSMessage(handleWSMessage);
    }
    function handleWSMessage(message) {
      if (!message || typeof message !== "object") {
        return;
      }
      switch (message.type) {
        case "system":
          handleSystemMessage(message);
          break;
        case "reply":
          handleBotReply(message);
          break;
        case "error":
          handleErrorMessage(message);
          break;
        default:
          appendMessage({
            id: `unknown-${Date.now()}`,
            from: "bot",
            msg_type: "text",
            text: JSON.stringify(message)
          });
      }
    }
    function handleSystemMessage(message) {
      if (message.text) {
        systemTip.value = message.text;
      }
    }
    function handleBotReply(message) {
      const payload = message.payload || {};
      const converted = normalizePayload(payload);
      if (converted.msg_type === "widget") {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:291", "[chat] widget payload", converted.widget, "raw", message.payload);
      }
      const topMeta = message.meta || {};
      const combinedMeta = __spreadValues(__spreadValues({}, payload.meta || {}), topMeta || {});
      const isChunk = topMeta && topMeta.is_final === false;
      const baseData = {
        from: "bot",
        msg_type: converted.msg_type,
        text: converted.text,
        card: converted.card,
        image: converted.image,
        audio: converted.audio,
        video: converted.video,
        file: converted.file,
        widget: converted.widget,
        media: converted.media,
        meta: combinedMeta,
        ts: message.server_ts || Date.now(),
        streaming: isChunk
      };
      if (isChunk) {
        systemTip.value = "AI 正在回复...";
        if (!activeStreamId.value) {
          activeStreamId.value = appendMessage(__spreadProps(__spreadValues({}, baseData), {
            id: `stream-${Date.now()}`
          }));
        } else {
          updateMessage(activeStreamId.value, baseData);
        }
        return;
      }
      if (activeStreamId.value) {
        updateMessage(activeStreamId.value, __spreadProps(__spreadValues({}, baseData), { streaming: false }));
        activeStreamId.value = null;
        systemTip.value = "";
        return;
      }
      appendMessage(__spreadProps(__spreadValues({}, baseData), {
        id: `bot-${Date.now()}`
      }));
      systemTip.value = "";
    }
    function normalizePayload(payload = {}) {
      const media = payload.media || null;
      let msgType = payload.msg_type;
      if (!msgType) {
        if (payload.card) {
          msgType = "card";
        } else if (payload.image) {
          msgType = "image";
        } else if (payload.audio || (media == null ? void 0 : media.type) === "audio") {
          msgType = "audio";
        } else if (payload.video || (media == null ? void 0 : media.type) === "video") {
          msgType = "video";
        } else if (payload.file || (media == null ? void 0 : media.type) === "file") {
          msgType = "file";
        } else if (payload.widget) {
          msgType = "widget";
        } else {
          msgType = "text";
        }
      }
      const resolvedAudio = payload.audio || ((media == null ? void 0 : media.type) === "audio" ? media : null);
      const resolvedVideo = payload.video || ((media == null ? void 0 : media.type) === "video" ? media : null);
      const resolvedFile = payload.file || ((media == null ? void 0 : media.type) === "file" ? media : null);
      return {
        msg_type: msgType,
        text: payload.text || "",
        card: payload.card || null,
        image: payload.image || null,
        audio: resolvedAudio,
        video: resolvedVideo,
        file: resolvedFile,
        widget: payload.widget || null,
        media
      };
    }
    function handleErrorMessage(message) {
      const errorText = message.message || message.text || "系统错误";
      systemTip.value = errorText;
      appendMessage({
        id: `error-${Date.now()}`,
        from: "system",
        msg_type: "text",
        text: `错误：${errorText}`
      });
    }
    function sendUserTextMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }
      appendMessage({
        id: `me-${Date.now()}`,
        from: "me",
        msg_type: "text",
        text: trimmed,
        ts: Date.now()
      });
      utils_langbot_ws.sendWSMessage({
        type: "message",
        client_ts: Date.now(),
        user_id: userId.value,
        conv_id: convId.value,
        payload: {
          msg_type: "text",
          text: trimmed
        }
      });
    }
    function handleSend() {
      const text = inputText.value;
      sendUserTextMessage(text);
      inputText.value = "";
    }
    function handleCardAction(action) {
      if (!action || typeof action !== "object") {
        return;
      }
      switch (action.type) {
        case "postback":
        case "reply":
          sendPostbackAction(action);
          break;
        case "submit_form":
          systemTip.value = action.text ? `请填写表单：${action.text}` : "表单提交流程待实现";
          emitActionMessage(action, { note: "form_submit_requested" });
          break;
        case "interrupt":
          sendInterrupt();
          break;
        default:
          emitActionMessage(action);
      }
    }
    function handleWidgetAction(action) {
      handleCardAction(action);
    }
    function handleCardMediaEvent(event) {
      if (!event)
        return;
      common_vendor.index.__f__("debug", "at pages/chat/chat.vue:445", "[chat] card media event", event);
    }
    function handleFileOpen(file) {
      common_vendor.index.__f__("debug", "at pages/chat/chat.vue:449", "[chat] file open", file);
    }
    function sendPostbackAction(action) {
      let replyText = "";
      if (typeof action.value === "string") {
        replyText = action.value;
      } else if (action.value && typeof action.value === "object" && typeof action.value.text === "string") {
        replyText = action.value.text;
      } else if (action.payload && typeof action.payload.text === "string") {
        replyText = action.payload.text;
      } else if (typeof action.text === "string") {
        replyText = action.text;
      }
      if (replyText) {
        appendMessage({
          id: `me-${Date.now()}`,
          from: "me",
          msg_type: "text",
          text: replyText,
          meta: { action }
        });
      }
      emitActionMessage(action, { user_text: replyText });
      systemTip.value = action.text ? `已选择：${action.text}` : "";
    }
    function emitActionMessage(action, extraMeta = {}) {
      utils_langbot_ws.sendWSMessage({
        type: "message",
        client_ts: Date.now(),
        user_id: userId.value,
        conv_id: convId.value,
        payload: {
          msg_type: "postback",
          text: action.text || `[${action.type}]`,
          meta: __spreadValues({
            action
          }, extraMeta)
        }
      });
    }
    function sendInterrupt() {
      utils_langbot_ws.sendWSMessage({
        type: "interrupt",
        client_ts: Date.now(),
        user_id: userId.value,
        conv_id: convId.value
      });
      systemTip.value = "已发送打断请求";
    }
    function fallbackText(msg) {
      if (!msg)
        return "";
      if (msg.text)
        return msg.text;
      return JSON.stringify(msg);
    }
    function toggleSettings() {
      settingsVisible.value = !settingsVisible.value;
    }
    function applySettings() {
      config.wsUrl = wsUrlInput.value.trim();
      config.httpUrl = httpUrlInput.value.trim();
      common_vendor.index.setStorageSync("langbot_ws_url", config.wsUrl);
      common_vendor.index.setStorageSync("langbot_http_base", config.httpUrl);
      utils_langbot_ws.closeWS();
      initNetwork();
      settingsVisible.value = false;
      systemTip.value = "连接已刷新";
    }
    common_vendor.onMounted(() => {
      const token = utils_auth.getToken();
      if (!token) {
        utils_auth.setToken("");
      }
      loadHistory();
      initNetwork();
      scrollToBottom();
    });
    common_vendor.onBeforeUnmount(() => {
      if (typeof unsubscribeWS === "function") {
        unsubscribeWS();
      }
      utils_langbot_ws.closeWS();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(convId.value),
        b: common_vendor.n(connectionStatus.value),
        c: common_vendor.t(statusLabel.value),
        d: common_vendor.t(settingsVisible.value ? "收起" : "设置"),
        e: common_vendor.o(toggleSettings),
        f: settingsVisible.value
      }, settingsVisible.value ? {
        g: wsUrlInput.value,
        h: common_vendor.o(($event) => wsUrlInput.value = $event.detail.value),
        i: httpUrlInput.value,
        j: common_vendor.o(($event) => httpUrlInput.value = $event.detail.value),
        k: common_vendor.o(applySettings)
      } : {}, {
        l: common_vendor.f(messages.value, (msg, index, i0) => {
          return common_vendor.e({
            a: msg.from === "system"
          }, msg.from === "system" ? {
            b: common_vendor.t(msg.text)
          } : msg.msg_type === "text" ? {
            d: "0a633310-0-" + i0,
            e: common_vendor.p({
              text: msg.text,
              from: msg.from
            })
          } : msg.msg_type === "card" ? {
            g: common_vendor.o(handleCardAction, msg.id || index),
            h: common_vendor.o(handleCardMediaEvent, msg.id || index),
            i: "0a633310-1-" + i0,
            j: common_vendor.p({
              card: msg.card,
              from: msg.from
            })
          } : msg.msg_type === "image" ? {
            l: "0a633310-2-" + i0,
            m: common_vendor.p({
              image: msg.image,
              from: msg.from
            })
          } : msg.msg_type === "audio" ? {
            o: "0a633310-3-" + i0,
            p: common_vendor.p({
              audio: msg.audio,
              from: msg.from
            })
          } : msg.msg_type === "video" ? {
            r: "0a633310-4-" + i0,
            s: common_vendor.p({
              video: msg.video,
              from: msg.from
            })
          } : msg.msg_type === "file" ? {
            v: common_vendor.o(handleFileOpen, msg.id || index),
            w: "0a633310-5-" + i0,
            x: common_vendor.p({
              file: msg.file,
              from: msg.from
            })
          } : msg.msg_type === "widget" ? {
            z: common_vendor.o(handleWidgetAction, msg.id || index),
            A: "0a633310-6-" + i0,
            B: common_vendor.p({
              widget: msg.widget,
              from: msg.from
            })
          } : {
            C: "0a633310-7-" + i0,
            D: common_vendor.p({
              text: fallbackText(msg),
              from: msg.from
            })
          }, {
            c: msg.msg_type === "text",
            f: msg.msg_type === "card",
            k: msg.msg_type === "image",
            n: msg.msg_type === "audio",
            q: msg.msg_type === "video",
            t: msg.msg_type === "file",
            y: msg.msg_type === "widget",
            E: msg.id || index,
            F: `msg-${index}`,
            G: common_vendor.n(msg.from)
          });
        }),
        m: scrollAnchor.value,
        n: systemTip.value
      }, systemTip.value ? {
        o: common_vendor.t(systemTip.value)
      } : {}, {
        p: common_vendor.o(handleSend),
        q: inputText.value,
        r: common_vendor.o(($event) => inputText.value = $event.detail.value),
        s: common_vendor.o(handleSend),
        t: !inputText.value.trim()
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0a633310"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/chat.js.map
