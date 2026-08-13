import { apiRequest } from './api-client.js';

export async function initGalleryPreview() {
    const trackWrap = document.querySelector('.gal-track');
    // Only run this on pages that have the gallery preview section
    if (!trackWrap) return;

    try {
        // API fetch disabled: using static images from HTML
        const staticImagesHtml = trackWrap.innerHTML;
        
        // Duplicate the static HTML to keep the infinite scroll CSS animation working
        trackWrap.innerHTML = `
            <!-- First set of images -->
            ${staticImagesHtml}
            <!-- Duplicated set of images for seamless infinite scroll (-50% transform) -->
            ${staticImagesHtml}
        `;
    } catch (error) {
        console.warn("[gallery-preview] Failed to initialize gallery preview.", error);
    }
}
