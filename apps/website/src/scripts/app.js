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

// =========================================================
// 12) OUR PROGRAMS — HORIZONTAL SCROLL CONTROLS
// =========================================================
(function () {
    const scrollWrap = document.querySelector('.prg-scroll-wrap');
    if (!scrollWrap) return;

    const track = scrollWrap.querySelector('.prg-scroll-track');
    const prevBtn = scrollWrap.querySelector('.prg-nav-prev');
    const nextBtn = scrollWrap.querySelector('.prg-nav-next');

    if (!track || !prevBtn || !nextBtn) return;

    // Scroll amount = one card width
    const scrollAmount = track.querySelector('.prg-card')?.offsetWidth || 340;

    function scrollLeft() {
        track.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }

    function scrollRight() {
        track.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    prevBtn.addEventListener('click', scrollLeft);
    nextBtn.addEventListener('click', scrollRight);

    // Click on track to scroll left (from left half) or right (from right half)
    track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) {
            scrollLeft();
        } else {
            scrollRight();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') scrollLeft();
        if (e.key === 'ArrowRight') scrollRight();
    });

    // Show/hide buttons on hover and focus
    scrollWrap.addEventListener('mouseenter', () => {
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    });

    scrollWrap.addEventListener('mouseleave', () => {
        prevBtn.style.opacity = '0';
        nextBtn.style.opacity = '0';
    });

    // Button focus visibility
    prevBtn.addEventListener('focus', () => {
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    });

    prevBtn.addEventListener('blur', () => {
        if (!scrollWrap.matches(':hover')) {
            prevBtn.style.opacity = '0';
        }
    });

    nextBtn.addEventListener('focus', () => {
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    });

    nextBtn.addEventListener('blur', () => {
        if (!scrollWrap.matches(':hover')) {
            nextBtn.style.opacity = '0';
        }
    });

    console.log('Our Programs horizontal scroll enabled');
})();
