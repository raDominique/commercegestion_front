
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}


// --- Gestion secure du refreshToken en cookie JS ---
const REFRESH_COOKIE = 'refreshToken';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function setRefreshToken(token, options = {}) {
  let cookie = `${REFRESH_COOKIE}=${token}`;
  let opts = {
    path: '/',
    sameSite: 'Strict',
    ...options,
  };
  if (window.location.protocol === 'https:' || import.meta.env.PROD) {
    cookie += '; Secure';
    opts.secure = true;
  }
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
  if (opts.path) cookie += `; Path=${opts.path}`;
  if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`;
  document.cookie = cookie;
}

export function getRefreshToken() {
  return getCookie(REFRESH_COOKIE);
}

export function clearRefreshToken() {
  document.cookie = `${REFRESH_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict` + (window.location.protocol === 'https:' || import.meta.env.PROD ? '; Secure' : '');
}
