const DEV_LOGIN_URL = 'http://localhost:5176';
const PROD_LOGIN_URL = 'https://login.amaanitvam.org';

export const COMMON_LOGIN_URL =
  import.meta.env.VITE_COMMON_LOGIN_URL ||
  (import.meta.env.DEV ? DEV_LOGIN_URL : PROD_LOGIN_URL);

export function redirectToCommonLogin(reason = 'signed-out') {
  const url = new URL(COMMON_LOGIN_URL);
  url.searchParams.set('loggedOut', '1');
  if (reason) url.searchParams.set('reason', reason);
  window.location.replace(url.toString());
}
