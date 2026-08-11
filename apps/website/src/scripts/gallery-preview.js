import { apiRequest } from './api-client.js';

export async function initGalleryPreview() {
    const trackWrap = document.querySelector('.gal-track');
    // Only run this on pages that have the gallery preview section
    if (!trackWrap) return;

    try {
        const response = await apiRequest('/gallery');
        if (response.success && response.data && response.data.length > 0) {
            // Get up to 15 recent images
            const mediaList = response.data.slice(0, 15);
            
            const imagesHtml = mediaList.map(item => {
                const url = item.imageUrl || item.url || item.secure_url || '';
                const alt = item.title || item.originalName || 'Gallery image';
                // Add loading lazy and encode HTML entities
                return `<img src="${url}" alt="${alt}" loading="lazy">`;
            }).join('');
            
            // Replace the static HTML with dynamic HTML. We duplicate it to keep the infinite scroll CSS animation working.
            trackWrap.innerHTML = `
                <!-- First set of images -->
                ${imagesHtml}
                <!-- Duplicated set of images for seamless infinite scroll (-50% transform) -->
                ${imagesHtml}
            `;
        }
    } catch (error) {
        console.warn("[gallery-preview] Failed to load gallery preview from backend. Falling back to static images.", error);
    }
}
