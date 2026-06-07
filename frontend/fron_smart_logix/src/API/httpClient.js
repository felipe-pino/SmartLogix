const API_URL_BASE = "http://localhost:8080";

export async function httpRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // 1. Configuramos los headers básicos
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 2. Si existe un token de sesión, lo inyectamos automáticamente
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    // 3. Realizamos la petición real al Backend de Spring Boot
    const response = await fetch(`${API_URL_BASE}${endpoint}`, config);

    // ========================================================
    // INTERCEPTOR DE ERRORES GLOBAL (REGLA DE LA RÚBRICA)
    // ========================================================
    if (response.status === 401 || response.status === 403) {
      console.warn("Sesión expirada o no autorizada. Limpiando credenciales...");
      
      // Borramos el token y datos guardados para proteger la app
      localStorage.clear();
      
      // Forzamos la redirección al Login de forma nativa e inmediata
      window.location.href = "/";
      
      throw new Error("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
    }

    // Si la respuesta no es exitosa (ej: 404, 500), lanzamos el error
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Si el backend responde un "204 No Content" (típico de DELETE exitosos), retornamos null
    if (response.status === 204) {
      return null;
    }

    // 4. Retornamos la respuesta JSON procesada para la capa de servicios
    return await response.json();

  } catch (error) {
    console.error("Error capturado en el httpClient:", error.message);
    throw error; // Re-lanzamos el error para que la página pueda enterarse si lo necesita
  }
}