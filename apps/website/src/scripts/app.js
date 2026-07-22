import { loadSharedComponents } from "./component-loader.js";
import { initNavbar } from "./navbar.js";

function initFAQ() {
    const faqButtons = document.querySelectorAll(".faq-question");

    faqButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const answer = button.nextElementSibling;
            const expanded =
                button.getAttribute("aria-expanded") === "true";

            // Close all
            faqButtons.forEach((btn) => {
                btn.setAttribute("aria-expanded", "false");
                btn.nextElementSibling.style.maxHeight = null;
                btn.nextElementSibling.classList.remove("active");
            });

            // Open clicked
            if (!expanded) {
                button.setAttribute("aria-expanded", "true");
                answer.classList.add("active");
                answer.style.maxHeight =
                    answer.scrollHeight + "px";
            }
        });
    });
}

async function initApp() {
    try {
        await loadSharedComponents();

        initNavbar();

        initFAQ();

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