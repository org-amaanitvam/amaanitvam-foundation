function getComponentPath(filename) {
  return `/src/components/${filename}`;
}

async function fetchComponent(filename) {
  const componentUrl = getComponentPath(filename);
  const response = await fetch(componentUrl, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(
      `${filename} load failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

async function loadHtml(targetId, filename) {
  const target = document.getElementById(targetId);

  if (!target) {
    console.warn(`Target not found: #${targetId}`);
    return;
  }

  try {
    target.innerHTML = await fetchComponent(filename);
  } catch (error) {
    console.error(`Unable to load ${getComponentPath(filename)}:`, error);
    target.innerHTML = `<p class="component-load-error">Unable to load ${filename}</p>`;
  }
}

async function loadFooterWithDonationCta() {
  const target = document.getElementById("footer");

  if (!target) {
    console.warn("Target not found: #footer");
    return;
  }

  try {
    const [donationCta, footer] = await Promise.all([
      fetchComponent("donation-cta.html"),
      fetchComponent("footer.html"),
    ]);

    target.innerHTML = `${donationCta}\n${footer}`;
  } catch (error) {
    console.error("Unable to load footer components:", error);
    target.innerHTML =
      '<p class="component-load-error">Unable to load footer</p>';
  }
}

async function insertSocialBar() {
  if (!document.body || document.querySelector(".floating-socials")) {
    return;
  }

  try {
    const socialBar = await fetchComponent("social-bar.html");
    document.body.insertAdjacentHTML("beforeend", socialBar);
  } catch (error) {
    console.error("Unable to load social-bar.html:", error);
  }
}

export async function loadSharedComponents() {
  await Promise.all([
    loadHtml("navbar-placeholder", "navbar.html"),
    loadFooterWithDonationCta(),
  ]);

  await insertSocialBar();
}
