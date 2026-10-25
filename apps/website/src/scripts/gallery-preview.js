import { apiRequest } from './api-client.js';

export async function initGalleryPreview() {
    const trackWrap = document.querySelector('.gal-track');
    // Only run this on pages that have the gallery preview section
    if (!trackWrap) return;

    try {
        if (trackWrap.dataset.duplicated) return;
        trackWrap.dataset.duplicated = 'true';

        // If the HTML doesn't already have the duplicated set, duplicate it for seamless infinite scroll
        if (!trackWrap.innerHTML.includes('Duplicated set of images')) {
            const staticImagesHtml = trackWrap.innerHTML;
            trackWrap.innerHTML = `
                <!-- First set of images -->
                ${staticImagesHtml}
                <!-- Duplicated set of images for seamless infinite scroll (-50% transform) -->
                ${staticImagesHtml}
            `;
        }
    } catch (error) {
        console.warn("[gallery-preview] Failed to initialize gallery preview.", error);
    }
}
