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

const DEFAULT_TIMEOUT_MS = 45000;

// 408/425 are request timeouts, 5xx are upstream failures. 4xx responses are
// real answers from the API and must not be replayed against another backend.
const RETRYABLE_STATUSES = new Set([
  408, 425, 500, 502, 503, 504, 521, 522, 523, 524,
]);

let preferredApiBase = null;

export function getPreferredApiBase() {
  return preferredApiBase || API_BASE_URL;
}

export function getApiBaseCandidates() {
  const ordered = preferredApiBase
    ? [preferredApiBase, ...API_BASE_URLS]
    : API_BASE_URLS;

  return [...new Set(ordered)];
}

async function readResponseBody(response) {
  if (response.status === 204) return {};

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return text ? { message: text } : {};
}

/**
 * Fetch a path from the first healthy backend.
 *
 * Returns the parsed body, the Response and the base URL that answered.
 * Network errors, timeouts and retryable upstream statuses move on to the
 * next backend; client errors and `success: false` responses stop immediately
 * so form submissions are never replayed twice.
 */
export async function apiFetch(path, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fallbackOnNotFound = false,
    ...fetchOptions
  } = options || {};

  let lastError;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
          try {
            controller.abort(new Error("Request timed out."));
          } catch {
            controller.abort();
          }
        }, Number(timeoutMs))
        : null;

    try {
      const externalSignal = fetchOptions.signal;
      const signal =
        externalSignal &&
          typeof AbortSignal !== "undefined" &&
          typeof AbortSignal.any === "function"
          ? AbortSignal.any([externalSignal, controller.signal])
          : controller.signal;

      const response = await fetch(`${baseUrl}${path}`, {
        ...fetchOptions,
        signal,
      });

      const data = await readResponseBody(response);

      if (!response.ok) {
        const error = new Error(
          data?.message || `Request failed: ${response.status}`,
        );
        error.status = response.status;
        error.data = data;
        error.baseUrl = baseUrl;

        const shouldRetry =
          RETRYABLE_STATUSES.has(response.status) ||
          (fallbackOnNotFound && response.status === 404);

        if (!shouldRetry) throw error;

        lastError = error;
        continue;
      }

      if (data && typeof data === "object" && data.success === false) {
        const error = new Error(data.message || "Request failed.");
        error.status = response.status;
        error.data = data;
        error.baseUrl = baseUrl;
        throw error;
      }

      preferredApiBase = baseUrl;
      return { data, response, baseUrl };
    } catch (error) {
      if (error?.status) throw error;
      lastError = error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  throw (
    lastError ||
    new Error("Unable to connect to the Amaanitvam API.")
  );
}

export async function apiRequest(path, options = {}) {
  const { data } = await apiFetch(path, options);
  return data;
}
