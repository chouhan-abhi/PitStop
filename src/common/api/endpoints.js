const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const apiBase = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");
const hasApiBase = Boolean(apiBase);

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

export const getApiBaseUrl = () => apiBase;
export const isProxyEnabled = () => hasApiBase;

export const buildApiEndpoint = (path, params = {}) => {
  const query = buildQueryString(params);
  if (hasApiBase) {
    return `${apiBase}${path}${query}`;
  }
  return null;
};

