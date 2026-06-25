import {
  loginRequest,
  registerRequest,
  getAllUsersRequest,
  getUserByIdRequest,
  updateUserRequest,
  deleteUserRequest
} from "../API/authApi";

/**
 * Realiza la petición de registro validando reglas de negocio en el cliente.
 */
export async function register({ username, email, password }) {
  if (!username || !username.trim()) {
    throw new Error("El usuario es requerido para el registro.");
  }
  if (!password || password.length < 6) {
    throw new Error("La contraseña de registro debe tener al menos 6 caracteres.");
  }
  return await registerRequest({ username, email, password });
}

/**
 * Realiza la petición de autenticación validando credenciales en el cliente.
 */
export async function login({ credential, password }) {
  if (!credential || !credential.trim()) {
    throw new Error("El usuario o correo electrónico es requerido.");
  }
  if (!password || password.length < 4) {
    throw new Error("La contraseña debe tener al menos 4 caracteres.");
  }
  return await loginRequest({ credential, password });
}

/**
 * Almacena la sesión del usuario preservando los métodos de pago guardados.
 */
export function saveLoginSession(loginResponse) {
  if (!loginResponse || !loginResponse.token) {
    throw new Error("Respuesta de autenticación inválida. Falta el token.");
  }

  localStorage.setItem("token", loginResponse.token);
  localStorage.setItem(
      "user",
      JSON.stringify({
        username: loginResponse.username,
        role: loginResponse.role,
        tokenType: loginResponse.tokenType || "Bearer",
      })
  );
}

/**
 * Cierra la sesión preservando los métodos de pago guardados.
 */
export function logout() {
  // Guardamos tarjetas antes de limpiar
  const savedCards = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("paymentMethod_")) {
      savedCards[key] = localStorage.getItem(key);
    }
  }

  localStorage.clear();

  // Restauramos tarjetas
  Object.entries(savedCards).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  window.location.href = "/";
}

export async function getAllUsers() {
  return await getAllUsersRequest();
}

export async function getUserById(id) {
  if (!id) throw new Error("ID de usuario no válido.");
  return await getUserByIdRequest(id);
}

export async function updateUser(id, userData) {
  if (!id) throw new Error("ID de usuario requerido para actualizar.");
  if (!userData || !userData.username || !userData.username.trim()) {
    throw new Error("El nombre de usuario no puede quedar vacío.");
  }
  return await updateUserRequest(id, userData);
}

export async function deleteUser(id) {
  if (!id) throw new Error("ID de usuario requerido para eliminar.");
  return await deleteUserRequest(id);
}

export function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return "$" + num.toFixed(2);
}

export function formatDate(dateString) {
  if (!dateString) return "Fecha no disponible";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function normalizeSearchTerm(text) {
  if (!text) return "";
  return text.trim().toLowerCase();
}