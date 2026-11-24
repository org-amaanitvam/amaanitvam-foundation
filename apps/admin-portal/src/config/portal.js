// Single source of truth for the common-login portal URL.
const DEV_LOGIN_URL = 'http://localhost:5176';
const PROD_LOGIN_URL = 'https://login.amaanitvam.org';

export const COMMON_LOGIN_URL = (
  import.meta.env.VITE_COMMON_LOGIN_URL ||
  (import.meta.env.DEV ? DEV_LOGIN_URL : PROD_LOGIN_URL)
).replace(/\/+$/, '');

// Builds the common-login URL, always keeping the portal-switcher session alive.
export function buildCommonLoginUrl(reason = 'signed-out') {
  const url = new URL(COMMON_LOGIN_URL);
  url.searchParams.set('switch', '1');
  if (reason) url.searchParams.set('reason', reason);
  return url.toString();
}

export function redirectToCommonLogin(reason = 'signed-out') {
  showLogoutOverlay();
  window.location.replace(buildCommonLoginUrl(reason));
}

// Full-screen curtain so the portal's own login screen never flashes
// between signOut() and the navigation to the common login app.
export function showLogoutOverlay(message = 'Signing you out\u2026') {
  if (typeof document === 'undefined') return;
  if (document.getElementById('af-logout-overlay')) return;
  const el = document.createElement('div');
  el.id = 'af-logout-overlay';
  el.setAttribute('role', 'status');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483647',
    'display:flex', 'flex-direction:column', 'align-items:center',
    'justify-content:center', 'gap:14px',
    'background:#1a0b10', 'color:#f5e9d7',
    'font:500 14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif',
  ].join(';');
  el.innerHTML =
    '<div style="width:34px;height:34px;border:3px solid rgba(212,175,55,.25);' +
    'border-top-color:#d4af37;border-radius:50%;' +
    'animation:af-logout-spin .8s linear infinite"></div>' +
    '<p style="margin:0;opacity:.8"></p>' +
    '<style>@keyframes af-logout-spin{to{transform:rotate(360deg)}}</style>';
  const p = el.querySelector('p');
  if (p) p.textContent = message;
  document.body.appendChild(el);
}
