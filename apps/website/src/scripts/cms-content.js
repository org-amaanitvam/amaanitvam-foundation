import { API_BASE_URL } from './api-client.js';

const CMS_URL = `${API_BASE_URL}/cms`;
const POLL_INTERVAL_MS = 30000;

let timer = null;
let previousUpdatedAt = '';

const value = (input) =>
  typeof input === 'string' ? input.trim() : '';

const applyText = (id, input) => {
  const element = document.getElementById(id);
  const text = value(input);

  if (!element || !text) return false;

  element.textContent = text;
  return true;
};

const extractContent = (payload) =>
  payload?.content ||
  payload?.data?.content ||
  payload?.data ||
  null;

const applyCmsContent = (content) => {
  if (!content || typeof content !== 'object') return false;

  let changed = false;

  changed = applyText(
    'hero-title',
    content.homepage?.heroTitle,
  ) || changed;

  changed = applyText(
    'hero-desc',
    content.homepage?.heroSubtitle,
  ) || changed;

  changed = applyText(
    'home-about-summary',
    content.homepage?.aboutSummary,
  ) || changed;

  changed = applyText(
    'mission-text',
    content.aboutUs?.mission,
  ) || changed;

  changed = applyText(
    'vision-text',
    content.aboutUs?.vision,
  ) || changed;

  changed = applyText(
    'about-history-text',
    content.aboutUs?.history,
  ) || changed;

  changed = applyText(
    'about-mission-text',
    content.aboutUs?.mission,
  ) || changed;

  changed = applyText(
    'about-vision-text',
    content.aboutUs?.vision,
  ) || changed;

  if (changed) {
    document.documentElement.dataset.cmsApplied = 'true';
  }

  return changed;
};

export async function refreshCmsContent({
  force = false,
} = {}) {
  try {
    const response = await fetch(
      `${CMS_URL}?t=${Date.now()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      },
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.success === false) {
      throw new Error(
        payload?.message ||
          `CMS request failed with status ${response.status}.`,
      );
    }

    const updatedAt = String(payload?.updatedAt || '');

    if (
      !force &&
      updatedAt &&
      previousUpdatedAt === updatedAt
    ) {
      return false;
    }

    const applied = applyCmsContent(
      extractContent(payload),
    );

    if (updatedAt) previousUpdatedAt = updatedAt;

    return applied;
  } catch (error) {
    console.warn(
      '[cms] Unable to refresh public content:',
      error?.message || error,
    );
    return false;
  }
}

export async function startCmsContentSync() {
  await refreshCmsContent({ force: true });

  if (timer) window.clearInterval(timer);

  timer = window.setInterval(
    refreshCmsContent,
    POLL_INTERVAL_MS,
  );

  window.addEventListener('focus', () => {
    refreshCmsContent();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshCmsContent();
    }
  });
}
