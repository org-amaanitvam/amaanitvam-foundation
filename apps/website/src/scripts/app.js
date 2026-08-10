import { loadSharedComponents } from "./component-loader.js";
import { initNavbar } from "./navbar.js";
import { startCmsContentSync } from "./cms-content.js";
import { initGalleryPreview } from "./gallery-preview.js";

function loadIndependentModules() {
    import("./forms.js").catch((error) => {
        console.error("Forms module error:", error);
        const campaignRoot = document.getElementById("homeCampaigns");
        if (
            campaignRoot &&
            campaignRoot.textContent.includes("Loading active campaigns")
        ) {
            campaignRoot.innerHTML = `
                <p class="campaign-error" role="alert">
                    Active campaigns could not be loaded. Please refresh the page or use the Donate Now link.
                </p>
            `;
        }
    });
}


function initFAQ({ allowMultiple = false } = {}) {
    const faqButtons = document.querySelectorAll(".faq-question");
    if (!faqButtons.length) return;

    const closeItem = (btn) => {
        const item = btn.closest(".faq-item");
        const answer = btn.nextElementSibling;
        if (!answer) return;

        btn.setAttribute("aria-expanded", "false");
        if (item) item.classList.remove("is-open");

        // 1. Set explicit pixel height before collapsing
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        // Force reflow so browser registers starting height
        void answer.offsetHeight;

        // 2. Animate down to 0
        answer.style.maxHeight = "0px";

        // 3. Clean up active class after transition finishes
        const onTransitionEnd = (e) => {
            if (e.propertyName === "max-height" && answer.style.maxHeight === "0px") {
                answer.classList.remove("active");
                answer.removeEventListener("transitionend", onTransitionEnd);
            }
        };
        answer.addEventListener("transitionend", onTransitionEnd);
    };

    const openItem = (btn) => {
        const item = btn.closest(".faq-item");
        const answer = btn.nextElementSibling;
        if (!answer) return;

        btn.setAttribute("aria-expanded", "true");
        if (item) item.classList.add("is-open");
        answer.classList.add("active");

        // Set pixel height to trigger expand transition
        answer.style.maxHeight = `${answer.scrollHeight}px`;

        // Once transition completes, set maxHeight to "none" so content isn't cut off on resize
        const onTransitionEnd = (e) => {
            if (e.propertyName === "max-height" && btn.getAttribute("aria-expanded") === "true") {
                answer.style.maxHeight = "none";
                answer.removeEventListener("transitionend", onTransitionEnd);
            }
        };
        answer.addEventListener("transitionend", onTransitionEnd);
    };

    faqButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isExpanded = button.getAttribute("aria-expanded") === "true";

            // If single mode (default), close other items first
            if (!allowMultiple) {
                faqButtons.forEach((btn) => {
                    if (btn !== button && btn.getAttribute("aria-expanded") === "true") {
                        closeItem(btn);
                    }
                });
            }

            // Toggle target item
            if (isExpanded) {
                closeItem(button);
            } else {
                openItem(button);
            }
        });
    });
}

// Initialize FAQ (set allowMultiple: true if you want multiple items open at once)
document.addEventListener("DOMContentLoaded", () => {
    initFAQ({ allowMultiple: false });
});

loadIndependentModules();

import("./gallery.js").catch((error) => {
    console.error("Gallery module error:", error);
});

async function initApp() {
    try {
        await loadSharedComponents();

        initNavbar();
        initFAQ();
        await startCmsContentSync();
        await initGalleryPreview();
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