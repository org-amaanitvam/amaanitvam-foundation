export const API_BASE_URL =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
    ? "http://localhost:5000/api"
    : "https://amaanitvam-foundation.onrender.com/api";

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw new Error(
      error?.message || "Unable to connect to the Amaanitvam API.",
    );
  }

  const data =
    response.status === 204
      ? {}
      : await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}
