import { loadSharedComponents } from './component-loader.js';
import { initNavbar } from './navbar.js';
import './forms.js';
import './gallery.js';

async function initApp() {
    await loadSharedComponents();
    initNavbar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}
