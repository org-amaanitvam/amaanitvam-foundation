function getComponentPath(filename) {
    return `/src/components/${filename}`;
}

async function loadHtml(targetId, filename) {
    const target = document.getElementById(targetId);

    if (!target) {
        console.warn(`Target not found: #${targetId}`);
        return;
    }

    const componentUrl = getComponentPath(filename);

    try {
        const response = await fetch(componentUrl, {
            cache: "no-cache",
        });

        if (!response.ok) {
            throw new Error(
                `${filename} load failed: ${response.status} ${response.statusText}`
            );
        }

        const html = await response.text();
        target.innerHTML = html;
    } catch (error) {
        console.error(`Unable to load ${componentUrl}:`, error);

        target.innerHTML = `
      <p style="padding: 12px; color: red;">
        Unable to load ${filename}
      </p>
    `;
    }
}

function insertSocialBar() {
    if (
        !document.body ||
        document.querySelector(".floating-socials")
    ) {
        return;
    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `
      <div class="floating-socials" aria-label="Social media links">
        <a
          href="https://www.facebook.com/people/Amaanitvam-Foundation/61583427622759/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i class="fa-brands fa-facebook-f"></i>
        </a>

        <a
          href="https://www.instagram.com/amaanitvamfoundation"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i class="fa-brands fa-instagram"></i>
        </a>

        <a
          href="https://x.com/AmaanitvamOrg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <i class="fa-brands fa-x-twitter"></i>
        </a>

        <a
          href="https://www.linkedin.com/company/amaanitvam-foundation/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i class="fa-brands fa-linkedin-in"></i>
        </a>
      </div>
    `
    );
}

export async function loadSharedComponents() {
    await Promise.all([
        loadHtml("navbar-placeholder", "navbar.html"),
        loadHtml("footer", "footer.html"),
    ]);

    insertSocialBar();
}