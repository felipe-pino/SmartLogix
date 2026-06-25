const API_URL_BASE = "http://localhost:8080";

// Limpia la sesión preservando los métodos de pago guardados
function clearSession() {
  const savedCards = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("paymentMethod_")) {
      savedCards[key] = localStorage.getItem(key);
    }
  }

  localStorage.clear();

  Object.entries(savedCards).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

/**
 * @param {string} endpoint
 * @param {RequestInit} options
 * @param {{ critical?: boolean }} meta
 *   critical: si es false, un 401/403 lanza el error pero NO limpia sesión ni redirige.
 *             Úsalo en peticiones secundarias (ej: getPaymentMethods dentro de OrdersPage).
 *             Por defecto es true para mantener comportamiento seguro en peticiones principales.
 */
export async function httpRequest(endpoint, options = {}, { critical = true } = {}) {
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

  try {
    const response = await fetch(`${API_URL_BASE}${endpoint}`, config);

    // ============================================================
    // INTERCEPTOR DE ERRORES GLOBAL
    // ============================================================

    if (response.status === 401) {
      // 401 = token inválido o expirado. Siempre cerrar sesión.
      console.warn("Sesión expirada (401). Limpiando credenciales...");
      clearSession();
      window.location.href = "/";
      throw new Error("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
    }

    if (response.status === 403) {
      // 403 = token válido pero sin permiso para este recurso.
      // En peticiones críticas (navegación principal) sí redirigimos.
      // En peticiones secundarias (ej: cargar métodos de pago dentro de otra página),
      // solo lanzamos el error para que el caller lo maneje sin botar al usuario.
      console.warn(`Acceso denegado (403) a ${endpoint}. critical=${critical}`);
      if (critical) {
        window.location.href = "/";
      }
      throw new Error(`Acceso denegado al recurso: ${endpoint}`);
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();

  } catch (error) {
    console.error("Error capturado en el httpClient:", error.message);
    throw error;
  }
}