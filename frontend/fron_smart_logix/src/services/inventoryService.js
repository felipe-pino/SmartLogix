import { API_URL_BASE, getToken } from "./authService";

/**
 * Obtiene el inventario desde el backend.
 * Implementa lectura segura de texto/JSON para evitar caídas del frontend.
 */
export async function getInventory() {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró una sesión activa. Por favor, inicia sesión.");
  }

  const response = await fetch(`${API_URL_BASE}/api/inventory`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  // Capturamos la respuesta como texto primero para evitar colapsar si no es un JSON válido
  const rawText = await response.text();

  if (!response.ok) {
    // Si el backend envió un JSON con mensaje de error, lo usamos; si no, usamos el estado HTTP
    try {
      const errorJson = JSON.parse(rawText);
      throw new Error(errorJson.message || `Error del servidor (${response.status})`);
    } catch {
      throw new Error(`Error ${response.status}: No se pudo acceder al inventario.`);
    }
  }

  // Parseo seguro de los datos de éxito
  try {
    return JSON.parse(rawText);
  } catch (e) {
    throw new Error("La respuesta del servidor no tiene un formato válido.");
  }
}