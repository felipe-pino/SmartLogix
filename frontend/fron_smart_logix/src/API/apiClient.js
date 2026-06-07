const API_URL_BASE = "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL_BASE}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }

  // Si es un DELETE (204 No Content), no intentamos parsear JSON
  if (response.status === 204) {
    return null; 
  }

  return await response.json();
}

export const apiClient = {
  get: (endpoint, options) => apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => apiRequest(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => apiRequest(endpoint, { method: "PUT", body, ...options }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: "DELETE", ...options }),
};