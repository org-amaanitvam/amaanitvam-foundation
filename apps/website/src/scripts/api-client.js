export const API_BASE_URL =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
    ? "http://localhost:5000/api"
    : "https://amaanitvam-foundation.onrender.com/api";

export const API_BASE_URLS = [
  "http://localhost:5000/api",
  "https://amaanitvam-foundation.onrender.com/api",
  "https://amaanitvam-foundation-1gjd.onrender.com/api",
];

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
