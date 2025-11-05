const TOKEN_KEY = 'langbot_token';
const USER_ID_KEY = 'langbot_user_id';

export function getToken() {
  try {
    return uni.getStorageSync(TOKEN_KEY) || '';
  } catch (error) {
    console.warn('[auth] getToken failed', error);
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) {
      uni.setStorageSync(TOKEN_KEY, token);
    } else {
      uni.removeStorageSync(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('[auth] setToken failed', error);
  }
}

export function clearToken() {
  setToken('');
}

export function getUserId() {
  try {
    return uni.getStorageSync(USER_ID_KEY) || '';
  } catch (error) {
    console.warn('[auth] getUserId failed', error);
    return '';
  }
}

export function setUserId(userId) {
  try {
    if (userId) {
      uni.setStorageSync(USER_ID_KEY, userId);
    } else {
      uni.removeStorageSync(USER_ID_KEY);
    }
  } catch (error) {
    console.warn('[auth] setUserId failed', error);
  }
}

