import { loadSharedComponents } from "./component-loader.js";
import { initNavbar } from "./navbar.js";

async function initApp() {
    try {
        // Navbar aur footer sabse pehle load honge
        await loadSharedComponents();

        // HTML insert hone ke baad navbar JS chalega
        initNavbar();

        // Optional scripts ki error navbar/footer ko block nahi karegi
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