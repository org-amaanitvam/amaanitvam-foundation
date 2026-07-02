/* Public gallery album loader
   Mirrors admin-created gallery folders on frontend/Website/gallery.html.
   Album covers use the first uploaded valid photo from each album. */
(function () {
  'use strict';

  const container = document.getElementById('gallery-album-container');
  const isGalleryPage = document.body?.dataset?.page === 'gallery' || /gallery\.html?$/i.test(window.location.pathname);
  if (!container || !isGalleryPage) return;

  let activeApiBase = cleanBase(
    container.dataset.galleryApiBase ||
    window.GALLERY_API_BASE ||
    window.API_BASE_URL ||
    localStorage.getItem('GALLERY_API_BASE') ||
    localStorage.getItem('API_BASE_URL') ||
    localStorage.getItem('backendUrl') ||
    ''
  );

  let currentFolders = [];
  let uncategorizedMedia = [];
  const folderMediaCache = new Map();

  function cleanBase(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function isLocalWebsiteHost() {
    return ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
  }

  function apiBaseCandidates() {
    const candidates = [];

    if (activeApiBase) candidates.push(activeApiBase);

    if (window.location.hostname.includes('github.dev')) {
      candidates.push(window.location.origin.replace(/-\d+\.github\.dev$/, '-5000.github.dev'));
    }

    if (isLocalWebsiteHost()) {
      candidates.push('http://localhost:5000');
      candidates.push('http://127.0.0.1:5000');
    }

    // Production/staging fallback: use same origin only when not running through Live Server.
    if (!['5500', '5501'].includes(window.location.port) && window.location.protocol !== 'file:') {
      candidates.push(window.location.origin);
    }

    return [...new Set(candidates.map(cleanBase).filter(Boolean))];
  }

  function backendBase() {
    const candidates = apiBaseCandidates();
    return cleanBase(activeApiBase || candidates[0] || 'http://localhost:5000');
  }

  async function fetchGalleryJson(path) {
    let lastError = null;

    for (const base of apiBaseCandidates()) {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`${base}${path}`, { signal: controller.signal }).finally(() => window.clearTimeout(timeout));
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || `Gallery request failed: ${response.status}`);
        }

        activeApiBase = base;
        return data;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Gallery backend is not reachable. Start backend with npm run dev.');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getId(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || value.mediaId || value.fileId || value.gridFsId || '';
  }

  function rawMediaUrl(media) {
    if (!media) return '';
    if (typeof media === 'string') return media;
    return media.imageUrl || media.url || media.secure_url || media.src || media.path || media.fileUrl || media.mediaUrl || '';
  }

  function normalizeMediaUrl(media) {
    const raw = String(rawMediaUrl(media) || '').trim();
    const id = getId(media);
    const base = backendBase();

    if (!raw && id) return `${base}/api/gallery/media/${encodeURIComponent(id)}`;
    if (!raw) return '';

    // Convert Live Server URLs like http://127.0.0.1:5500/api/gallery/media/id back to backend.
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.pathname.startsWith('/api/')) return `${base}${parsed.pathname}${parsed.search}`;
    } catch (_) {
      // Continue with string fallbacks below.
    }

    if (/^(data:|blob:)/i.test(raw)) return raw;
    if (/^https?:\/\//i.test(raw) && !raw.includes(':5500/api/')) return raw;

    if (raw.startsWith('/api/')) return `${base}${raw}`;
    if (raw.startsWith('api/')) return `${base}/${raw}`;

    if (raw.startsWith('/uploads/') || raw.startsWith('/gallery/') || raw.startsWith('/media/')) return `${base}${raw}`;
    if (raw.startsWith('uploads/') || raw.startsWith('gallery/') || raw.startsWith('media/')) return `${base}/${raw}`;

    return raw;
  }

  function isVideo(media) {
    const url = normalizeMediaUrl(media);
    return media?.mediaType === 'video'
      || String(media?.contentType || '').startsWith('video/')
      || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }

  function isImage(media) {
    if (!media) return false;
    if (media.mediaType === 'image') return true;
    if (String(media.contentType || '').startsWith('image/')) return true;
    return !isVideo(media);
  }

  function timestampValue(item) {
    const value = Date.parse(item?.createdAt || item?.uploadedAt || item?.updatedAt || '');
    return Number.isFinite(value) ? value : 0;
  }

  function sortByUploadOrder(mediaItems) {
    return [...(mediaItems || [])].sort((a, b) => {
      const byDate = timestampValue(a) - timestampValue(b);
      if (byDate !== 0) return byDate;
      return String(getId(a)).localeCompare(String(getId(b)));
    });
  }

  function firstUploadedPhoto(mediaItems) {
    return sortByUploadOrder(mediaItems).find(isImage) || null;
  }

  function pickFolderCover(folder) {
    return folder?.__coverMedia || folder?.coverMedia || folder?.coverImage || folder?.coverUrl || folder?.thumbnail || folder?.cover || null;
  }

  async function getFolderMedia(folderId) {
    if (folderMediaCache.has(folderId)) return folderMediaCache.get(folderId);

    const data = await fetchGalleryJson(`/api/gallery/folders/${encodeURIComponent(folderId)}/media`);
    const media = Array.isArray(data.images) ? data.images : Array.isArray(data.media) ? data.media : [];
    const ordered = sortByUploadOrder(media);
    folderMediaCache.set(folderId, ordered);
    return ordered;
  }

  async function hydrateFolderCovers() {
    const foldersToCheck = currentFolders.filter((folder) => {
      const id = getId(folder);
      return id && Number(folder.mediaCount || 0) > 0;
    });

    // Resolve every album cover from backend data. The backend patch now skips missing GridFS files,
    // and this frontend fallback keeps future albums safe even if coverMedia is empty.
    const batchSize = 4;
    for (let index = 0; index < foldersToCheck.length; index += batchSize) {
      const batch = foldersToCheck.slice(index, index + batchSize);
      await Promise.all(batch.map(async (folder) => {
        try {
          const existingCover = pickFolderCover(folder);
          const media = await getFolderMedia(getId(folder));
          const photoCandidates = sortByUploadOrder(media).filter(isImage);
          folder.__coverCandidates = photoCandidates;
          folder.__coverMedia = existingCover || photoCandidates[0] || media[0] || null;
        } catch (error) {
          console.warn('Could not resolve gallery album cover:', folder?.name || folder?._id, error);
          folder.__coverMedia = pickFolderCover(folder);
          folder.__coverCandidates = folder.__coverMedia ? [folder.__coverMedia] : [];
        }
      }));
    }
  }

  function placeholderMarkup(extraClass = '') {
    return `<div class="gallery-album-placeholder ${extraClass}" aria-hidden="true">
      <span class="material-symbols-outlined">photo_library</span>
    </div>`;
  }

  function mediaThumb(media, extraClass = '') {
    const url = normalizeMediaUrl(media);
    const title = escapeHtml(media?.title || media?.originalName || media?.filename || media?.name || 'Gallery media');

    if (!url) return placeholderMarkup(extraClass);

    if (isVideo(media)) {
      return `<video class="${extraClass}" src="${escapeHtml(url)}" controls playsinline preload="metadata" aria-label="${title}"></video>`;
    }

    return `<img class="${extraClass}" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" />`;
  }

  function albumCoverMarkup(folder) {
    const id = getId(folder);
    const cover = pickFolderCover(folder);
    const url = normalizeMediaUrl(cover);
    const title = escapeHtml(cover?.title || cover?.originalName || folder?.name || 'Gallery album cover');

    if (!url) return placeholderMarkup('gallery-album-cover-media');

    if (isVideo(cover)) {
      return `<video class="gallery-album-cover-media" src="${escapeHtml(url)}" muted playsinline preload="metadata" aria-label="${title}"></video>`;
    }

    return `<img class="gallery-album-cover-media" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" data-folder-id="${escapeHtml(id)}" data-cover-index="0" />`;
  }

  function attachCoverFallbacks() {
    container.querySelectorAll('img.gallery-album-cover-media[data-folder-id]').forEach((img) => {
      img.addEventListener('error', () => {
        const folderId = img.dataset.folderId;
        const folder = currentFolders.find((item) => String(getId(item)) === String(folderId));
        const candidates = folder?.__coverCandidates || [];
        let nextIndex = Number(img.dataset.coverIndex || 0) + 1;

        while (nextIndex < candidates.length) {
          const nextUrl = normalizeMediaUrl(candidates[nextIndex]);
          if (nextUrl && nextUrl !== img.src) {
            img.dataset.coverIndex = String(nextIndex);
            img.src = nextUrl;
            img.alt = candidates[nextIndex]?.title || candidates[nextIndex]?.originalName || folder?.name || 'Gallery album cover';
            return;
          }
          nextIndex += 1;
        }

        img.replaceWith(document.createRange().createContextualFragment(placeholderMarkup('gallery-album-cover-media')));
      });
    });
  }

  function setIntro(title, description) {
    const heading = document.getElementById('gallery-grid-title');
    const introText = document.querySelector('.gallery-intro .section-desc');
    if (heading) heading.textContent = title;
    if (introText && description) introText.textContent = description;
  }

  function albumCountLabel(count) {
    const total = Number(count || 0);
    return `${total} ${total === 1 ? 'media item' : 'media items'}`;
  }

  function renderMessage(message, tone = 'info') {
    container.className = 'gallery-album-shell';
    container.innerHTML = `<div class="gallery-state gallery-state-${tone}">${escapeHtml(message)}</div>`;
  }

  function renderAlbums() {
    setIntro('Browse Gallery Albums', 'Open an album to view images and videos grouped by the same folders created in the admin portal.');
    container.className = 'gallery-grid gallery-albums-grid';

    const albums = [...currentFolders];

    if (uncategorizedMedia.length) {
      const orderedUncategorized = sortByUploadOrder(uncategorizedMedia);
      albums.push({
        _id: '__uncategorized__',
        name: 'Uncategorized',
        description: 'Media that has not been assigned to any album yet.',
        mediaCount: orderedUncategorized.length,
        __coverMedia: firstUploadedPhoto(orderedUncategorized) || orderedUncategorized[0] || null,
        __coverCandidates: orderedUncategorized.filter(isImage),
      });
    }

    if (!albums.length) {
      renderMessage('No gallery albums are available yet. Albums uploaded from the admin portal will appear here automatically.');
      return;
    }

    container.innerHTML = albums.map((folder) => {
      const id = getId(folder);
      const name = folder.name || folder.title || 'Untitled Album';
      const description = folder.description || 'View photos and videos from this album.';

      return `<article class="gallery-album-card gallery-card reveal-card" data-folder-id="${escapeHtml(id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(name)} album">
        <div class="gallery-album-cover">
          ${albumCoverMarkup(folder)}
          <span class="gallery-album-count">${escapeHtml(albumCountLabel(folder.mediaCount))}</span>
        </div>
        <div class="gallery-album-body">
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(description)}</p>
          <span class="gallery-album-open">Open Album <span aria-hidden="true">→</span></span>
        </div>
      </article>`;
    }).join('');

    container.querySelectorAll('.gallery-album-card').forEach((card) => {
      const folderId = card.dataset.folderId;
      const open = () => openAlbum(folderId);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    });

    attachCoverFallbacks();
  }

  async function openAlbum(folderId) {
    const folder = folderId === '__uncategorized__'
      ? { _id: '__uncategorized__', name: 'Uncategorized', description: 'Media that has not been assigned to any album yet.' }
      : currentFolders.find((item) => String(getId(item)) === String(folderId));

    if (!folder) return;

    setIntro(folder.name || 'Gallery Album', folder.description || 'Browse images and videos from this album.');
    container.className = 'gallery-album-shell';
    container.innerHTML = `<div class="gallery-album-toolbar">
      <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
      <div>
        <span class="gallery-album-kicker">Album</span>
        <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
      </div>
    </div>
    <div class="gallery-state">Loading album media...</div>`;

    document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);

    try {
      const media = folderId === '__uncategorized__'
        ? sortByUploadOrder(uncategorizedMedia)
        : await getFolderMedia(folderId);
      renderAlbumMedia(folder, media);
    } catch (error) {
      renderMessage(error.message || 'Failed to load this album.', 'error');
    }
  }

  function renderAlbumMedia(folder, media) {
    container.className = 'gallery-album-shell';

    const count = albumCountLabel(media.length);
    const grid = media.length
      ? `<div class="gallery-album-media-grid">
          ${media.map((item) => {
            const title = item.title || item.originalName || item.filename || 'Gallery media';
            return `<figure class="gallery-media-card gallery-card reveal-card">
              <div class="gallery-media-frame">${mediaThumb(item, 'gallery-media-file')}</div>
              <figcaption>${escapeHtml(title)}</figcaption>
            </figure>`;
          }).join('')}
        </div>`
      : `<div class="gallery-state">No media has been uploaded in this album yet.</div>`;

    container.innerHTML = `<div class="gallery-album-toolbar">
      <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
      <div>
        <span class="gallery-album-kicker">${escapeHtml(count)}</span>
        <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
      </div>
    </div>
    ${grid}`;

    document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);
  }

  async function initAlbumGallery() {
    renderMessage('Loading gallery albums...');

    try {
      const foldersData = await fetchGalleryJson('/api/gallery/folders');
      const uncategorizedData = await fetchGalleryJson('/api/gallery?uncategorized=true').catch(() => ({ images: [] }));

      currentFolders = Array.isArray(foldersData.folders) ? foldersData.folders : [];
      uncategorizedMedia = Array.isArray(uncategorizedData.images) ? uncategorizedData.images : [];

      await hydrateFolderCovers();
      renderAlbums();
    } catch (error) {
      renderMessage(error.message || 'Failed to load gallery albums.', 'error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlbumGallery, { once: true });
  } else {
    initAlbumGallery();
  }
})();
