import { loadSharedComponents } from "./component-loader.js";
import { initNavbar } from "./navbar.js";
import { startCmsContentSync } from "./cms-content.js";

async function initApp() {
    try {
        await loadSharedComponents();

        initNavbar();
        await startCmsContentSync();

        import("./forms.js").catch((error) => {
            console.error("Forms module error:", error);
        });

        import("./gallery.js").catch((error) => {
            console.error("Gallery module error:", error);
        });

    } catch (error) {
        console.error("App initialization failed:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp, {
        once: true,
    });
} else {
    initApp();
}
(function () {
    const counters = document.querySelectorAll('.impx-count[data-count-to]');
    if (!counters.length) return;

    const animate = (el) => {
        const target = parseInt(el.dataset.countTo, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1300;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach((el) => observer.observe(el));
})();