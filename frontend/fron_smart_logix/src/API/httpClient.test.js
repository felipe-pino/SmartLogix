import { describe, it, expect, beforeEach, vi } from "vitest";
import { httpRequest } from "./httpClient"; // Asegúrate de que la ruta apunte a tu archivo original

describe("Pruebas Unitarias - Interceptor HTTP (httpClient)", () => {
  
  beforeEach(() => {
    // Limpiamos todos los mocks antes de cada prueba para que no se mezclen
    vi.restoreAllMocks();
    
    // Simulamos el localStorage de forma manual
    const store = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    });

    // Simulamos el window.location para capturar las redirecciones
    vi.stubGlobal("window", {
      location: { href: "" }
    });

    // Simulamos el console.warn y console.error para no ensuciar la terminal con los logs esperados
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // ==========================================
  // 1. PRUEBA DE INYECCIÓN DE TOKEN
  // ==========================================
  it("debe inyectar el token Bearer en los headers si existe en localStorage", async () => {
    // Simulamos que el usuario ya inició sesión y tiene un token guardado
    localStorage.setItem("token", "mi_token_secreto_123");

    // Simulamos una respuesta exitosa del backend (Spring Boot)
    const mockResponse = { data: "datos_seguros" };
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    // Ejecutamos la petición
    const resultado = await httpRequest("/api/dashboard");

    // Verificaciones:
    expect(resultado).toEqual(mockResponse);
    // Revisamos que fetch se haya llamado inyectando el Bearer token en los headers
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/dashboard",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mi_token_secreto_123",
          "Content-Type": "application/json"
        })
      })
    );
  });

  // ==========================================
  // 2. PRUEBA DEL INTERCEPTOR DE ERRORES (401/403)
  // ==========================================
  it("debe limpiar el localStorage y redirigir al login '/' si el backend retorna un error 401", async () => {
    // Simulamos que el backend dice que tu sesión expiró (401 Unauthorized)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
    }));

    // Ejecutamos la petición esperando que falle y lance el error del interceptor
    await expect(httpRequest("/api/dashboard")).rejects.toThrow(
      "Su sesión ha expirado. Por favor, inicie sesión nuevamente."
    );

    // Verificaciones de la REGLA DE LA RÚBRICA:
    expect(localStorage.clear).toHaveBeenCalled(); // Comprueba que borró las credenciales
    expect(window.location.href).toBe("/"); // Comprueba que forzó la redirección al Login nativo
  });

  // ==========================================
  // 3. PRUEBA DE RESPUESTA VACÍA (204 NO CONTENT)
  // ==========================================
  it("debe retornar null si el backend responde con un estado 204 (No Content)", async () => {
    // Simulamos un código 204 (típico al eliminar un registro con éxito)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 204,
      ok: true,
    }));

    const resultado = await httpRequest("/api/eliminar/1", { method: "DELETE" });

    // Verificación:
    expect(resultado).toBeNull();
  });

  // ==========================================
  // 4. PRUEBA DE ERROR GENÉRICO (500 / 404)
  // ==========================================
  it("debe lanzar un error HTTP si la respuesta del servidor no es exitosa", async () => {
    // Simulamos un error interno del servidor (500)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
    }));

    // Debe re-lanzar el error para que la vista se entere del problema
    await expect(httpRequest("/api/productos")).rejects.toThrow("Error HTTP: 500");
  });
});