const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const LEGACY_API_BASE_URL = "https://amaanitvam-foundation.onrender.com/api";
const ACTIVE_API_BASE_URL = "https://amaanitvam-foundation-1gjd.onrender.com/api";

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:";

// The browser hits the environment-appropriate backend first, then falls back
// to the remaining known deployments (kept so the site survives outages).
export const API_BASE_URL = isLocalHost
  ? LOCAL_API_BASE_URL
  : ACTIVE_API_BASE_URL;

export const API_BASE_URLS = [
  API_BASE_URL,
  LOCAL_API_BASE_URL,
  LEGACY_API_BASE_URL,
  ACTIVE_API_BASE_URL,
].filter((url, index, all) => all.indexOf(url) === index);

export async function apiRequest(path, options = {}) {
  let lastError;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);

      if (response.ok) {
        const data =
          response.status === 204
            ? {}
            : await response.json().catch(() => ({}));
        return data;
      }

      lastError = new Error(
        response?.data?.message || `Request failed: ${response.status}`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError?.message || "Unable to connect to the Amaanitvam API.",
  );
}
