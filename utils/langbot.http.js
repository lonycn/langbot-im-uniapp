const DEFAULT_HTTP_OPTIONS = {
  baseURL: '',
  timeout: 10000,
  getAuthToken: () => '',
};

let httpOptions = { ...DEFAULT_HTTP_OPTIONS };

export function configureHttp(options = {}) {
  httpOptions = { ...httpOptions, ...options };
}

export function postJson(path, data = {}, extraHeaders = {}) {
  return request('POST', path, data, extraHeaders);
}

export function getJson(path, params = {}, extraHeaders = {}) {
  return request('GET', path, params, extraHeaders);
}

function request(method, path, payload, extraHeaders = {}) {
  const url = resolveURL(path);
  const headers = buildHeaders(extraHeaders);

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      timeout: httpOptions.timeout,
      data: payload,
      header: headers,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(
            new Error(
              `[langbot.http] Request failed: ${res.statusCode} ${JSON.stringify(res.data)}`
            )
          );
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

function resolveURL(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const base = httpOptions.baseURL || '';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function buildHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const token =
    typeof httpOptions.getAuthToken === 'function'
      ? httpOptions.getAuthToken()
      : httpOptions.getAuthToken;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

