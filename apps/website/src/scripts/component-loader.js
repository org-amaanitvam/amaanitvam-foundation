function getComponentPath(filename) {
    return `../components/${filename}`;
}

async function loadHtml(targetId, filename) {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
        const response = await fetch(getComponentPath(filename));
        if (!response.ok) throw new Error(`${filename} not found`);
        target.innerHTML = await response.text();
    } catch (error) {
        console.error(`Unable to load ${filename}:`, error);
    }
}

function insertSocialBar() {
    if (!document.body || document.querySelector('.floating-socials')) return;

    document.body.insertAdjacentHTML('beforeend', `
    <div class="floating-socials" aria-label="Social media links">
      <a href="https://www.facebook.com/people/Amaanitvam-Foundation/61583427622759/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="https://www.instagram.com/amaanitvamfoundation" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
      <a href="https://x.com/AmaanitvamOrg" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
      <a href="https://www.linkedin.com/company/amaanitvam-foundation/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
    </div>
  `);
}

export async function loadSharedComponents() {
    await Promise.all([
        loadHtml('navbar-placeholder', 'navbar.html'),
        loadHtml('footer', 'footer.html')
    ]);

    insertSocialBar();
}
