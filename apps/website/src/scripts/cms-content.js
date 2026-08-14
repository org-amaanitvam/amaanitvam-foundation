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


const escapeHtml = (input) =>
  String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const AVATAR_VARIANTS = ['a', 'b', 'c', 'd'];

const teamCardMarkup = (member) => {
  const avatar = AVATAR_VARIANTS.includes(String(member?.avatar))
    ? member.avatar
    : 'a';
  const name = escapeHtml(member?.name);
  const role = escapeHtml(member?.role);
  const bio = escapeHtml(member?.bio);
  const email = escapeHtml(member?.email);

  const emailMarkup = email
    ? `<p class="team-email"><a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=${email}" rel="noopener noreferrer" target="_blank">${email}</a></p>`
    : '';
  const bioMarkup = bio
    ? `<p class="text-muted team-card__bio">${bio}</p>`
    : '';

  return `<article class="card team-card">
      <div class="team-card__avatar team-card__avatar--${avatar}">
        <span aria-hidden="true" class="material-symbols-outlined team-card__avatar-icon">person</span>
      </div>
      <h3 class="team-card__name">${name}</h3>
      <p class="text-primary team-card__role">${role}</p>
      ${bioMarkup}
      ${emailMarkup}
    </article>`;
};

const applyTeam = (team) => {
  const container = document.getElementById('team-groups');
  if (!container) return false;

  const members = Array.isArray(team?.members) ? team.members : [];
  const visible = members
    .filter((member) => member && member.visible !== false)
    .filter((member) => value(member.name) || value(member.role))
    .slice()
    .sort(
      (a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0),
    );

  if (!visible.length) return false;

  applyText('team-heading', team?.heading);
  applyText('team-subheading', team?.subheading);

  const rowOne = visible.filter((member) => Number(member.group) !== 2);
  const rowTwo = visible.filter((member) => Number(member.group) === 2);

  const rows = [];
  if (rowOne.length) {
    rows.push(
      `<div class="team-row team-row-1">${rowOne.map(teamCardMarkup).join('')}</div>`,
    );
  }
  if (rowTwo.length) {
    rows.push(
      `<div class="team-row team-row-2">${rowTwo.map(teamCardMarkup).join('')}</div>`,
    );
  }

  container.innerHTML = rows.join('');
  return true;
};

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

  changed = applyTeam(content.team) || changed;

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
