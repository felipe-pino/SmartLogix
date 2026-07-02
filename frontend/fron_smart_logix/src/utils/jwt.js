/**
 * Utilidades para leer el JWT en el cliente.
 *
 * OJO: esto NO verifica la firma (no se puede sin el secreto del backend).
 * Solo sirve para leer los claims (role, exp, sub) y detectar manipulación
 * comparando esos claims contra lo que haya en localStorage.
 * La autorización real siempre la hace el backend.
 */

export function decodeToken(token) {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function isTokenExpired(decoded) {
    if (!decoded || !decoded.exp) return true;
    // exp viene en segundos, Date.now() en milisegundos
    return Date.now() >= decoded.exp * 1000;
}

/**
 * Verifica que la sesión guardada en localStorage sea íntegra:
 * - Existe token, es un JWT parseable y no está vencido.
 * - El rol guardado en "user" coincide con el rol firmado dentro del token.
 *   Si no coincide, alguien editó localStorage manualmente (ej. para
 *   intentar acceder a una vista de otro rol) y la sesión se da por inválida.
 */
export function isSessionValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded)) return false;

    const storedUserRaw = localStorage.getItem("user");
    if (storedUserRaw) {
        try {
            const storedUser = JSON.parse(storedUserRaw);
            if (storedUser?.role && storedUser.role !== decoded.role) {
                return false;
            }
        } catch {
            return false;
        }
    }

    return true;
}

/** Rol confiable: siempre se lee del token, nunca del objeto "user" suelto. */
export function getTrustedRole() {
    const decoded = decodeToken(localStorage.getItem("token"));
    return decoded?.role ?? null;
}