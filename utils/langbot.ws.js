const DEFAULT_OPTIONS = {
  url: '',
  userId: '',
  convId: 'c_langbot',
  getAuthToken: () => '',
  reconnect: true,
  maxRetries: 6,
  retryInterval: 1000,
  onOpen: null,
  onClose: null,
  onError: null,
  onStatusChange: null,
};

let socket = null;
let listeners = new Set();
let connectionOptions = { ...DEFAULT_OPTIONS };
let reconnectAttempts = 0;
let reconnectTimer = null;
let manualClose = false;

function notifyStatus(status) {
  if (typeof connectionOptions.onStatusChange === 'function') {
    try {
      connectionOptions.onStatusChange(status);
    } catch (error) {
      console.error('[langbot.ws] onStatusChange callback error', error);
    }
  }
}

function buildInitPayload() {
  const authToken = typeof connectionOptions.getAuthToken === 'function'
    ? connectionOptions.getAuthToken()
    : connectionOptions.getAuthToken;

  const payload = {
    type: 'init',
    user_id: connectionOptions.userId,
    conv_id: connectionOptions.convId,
  };

  if (authToken) {
    payload.auth = { token: authToken };
  }

  return payload;
}

export function configureWS(options = {}) {
  connectionOptions = { ...connectionOptions, ...options };
}

export function connectWS(options = {}) {
  if (socket && typeof socket.readyState !== 'undefined' && socket.readyState !== 3) {
    return;
  }

  connectionOptions = { ...connectionOptions, ...options };

  if (!connectionOptions.url || !connectionOptions.userId) {
    console.warn('[langbot.ws] url and userId must be provided before connecting.');
    return;
  }

  manualClose = false;
  clearReconnectTimer();
  notifyStatus('connecting');

  socket = uni.connectSocket({
    url: connectionOptions.url,
    complete: () => {},
  });

  socket.onOpen(() => {
    reconnectAttempts = 0;
    notifyStatus('connected');
    socket.send({ data: JSON.stringify(buildInitPayload()) });
    if (typeof connectionOptions.onOpen === 'function') {
      try {
        connectionOptions.onOpen();
      } catch (error) {
        console.error('[langbot.ws] onOpen callback error', error);
      }
    }
  });

  socket.onMessage((event) => {
    let data = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.warn('[langbot.ws] Failed to parse message', error);
      }
    }

    listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (error) {
        console.error('[langbot.ws] listener thrown error', error);
      }
    });
  });

  socket.onClose(() => {
    socket = null;
    notifyStatus(manualClose ? 'closed' : 'reconnecting');
    if (typeof connectionOptions.onClose === 'function') {
      try {
        connectionOptions.onClose();
      } catch (error) {
        console.error('[langbot.ws] onClose callback error', error);
      }
    }
    if (!manualClose && connectionOptions.reconnect) {
      scheduleReconnect();
    }
  });

  socket.onError((error) => {
    notifyStatus('error');
    if (typeof connectionOptions.onError === 'function') {
      try {
        connectionOptions.onError(error);
      } catch (callbackError) {
        console.error('[langbot.ws] onError callback error', callbackError);
      }
    }
    if (socket) {
      socket.close();
    }
  });
}

export function onWSMessage(listener) {
  if (typeof listener === 'function') {
    listeners.add(listener);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function sendWSMessage(payload) {
  if (!socket) {
    console.warn('[langbot.ws] socket not connected, message dropped');
    return;
  }

  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  socket.send({ data });
}

export function closeWS() {
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
    console.warn('[langbot.ws] reached max reconnect attempts');
    return;
  }

  const baseDelay = connectionOptions.retryInterval * Math.pow(2, reconnectAttempts - 1);
  const jitter = Math.random() * baseDelay * 0.3;
  const delay = Math.min(baseDelay + jitter, 30000);

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

export function isConnected() {
  return !!socket;
}
