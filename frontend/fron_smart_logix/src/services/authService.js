import { 
  loginRequest, 
  registerRequest, // <-- IMPORTAMOS LA NUEVA PETICIÓN DE API
  getAllUsersRequest, 
  getUserByIdRequest, 
  updateUserRequest, 
  deleteUserRequest 
} from "../api/authApi";

/**
 * Realiza la petición de registro validando reglas de negocio en el cliente.
 */
export async function register({ username, email, password }) {
  // REGLA DE NEGOCIO: Validar campos obligatorios antes de disparar la red
  if (!username || !username.trim()) {
    throw new Error("El usuario es requerido para el registro.");
  }
  if (!password || password.length < 6) {
    throw new Error("La contraseña de registro debe tener al menos 6 caracteres.");
  }

  // Ahora sí enviamos las variables con los nombres correctos al API
  return await registerRequest({ username, email, password });
}

/**
 * Realiza la petición de autenticación validando credenciales en el cliente.
 */
export async function login({ credential, password }) {
  // REGLA DE NEGOCIO: Validar campos obligatorios antes de disparar la red
  if (!credential || !credential.trim()) {
    throw new Error("El usuario o correo electrónico es requerido.");
  }
  if (!password || password.length < 4) {
    throw new Error("La contraseña debe tener al menos 4 caracteres.");
  }
  
  return await loginRequest({ credential, password });
}

/**
 * Almacena de forma segura la sesión del usuario en el ecosistema del navegador.
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
 * Obtiene la lista completa de usuarios del sistema.
 */
export async function getAllUsers() {
  return await getAllUsersRequest();
}

/**
 * Obtiene los detalles de un usuario específico por su ID.
 */
export async function getUserById(id) {
  if (!id) {
    throw new Error("ID de usuario no válido.");
  }
  return await getUserByIdRequest(id);
}

/**
 * Modifica los datos de un usuario validando consistencia elemental.
 */
export async function updateUser(id, userData) {
  if (!id) {
    throw new Error("ID de usuario requerido para actualizar.");
  }
  if (!userData || !userData.username || !userData.username.trim()) {
    throw new Error("El nombre de usuario no puede quedar vacío.");
  }
  
  return await updateUserRequest(id, userData);
}

/**
 * Elimina un usuario del sistema mediante su ID.
 */
export async function deleteUser(id) {
  if (!id) {
    throw new Error("ID de usuario requerido para eliminar.");
  }
  return await deleteUserRequest(id);
}

/**
 * Formatea un número o string numérico a formato de moneda ($1,500.50)
 * Si el valor es inválido o no numérico, retorna $0.00
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num)) {
    return "$0.00";
  }
  return "$" + num.toFixed(2);
}

/**
 * Convierte una fecha en formato ISO (AAAA-MM-DD...) a formato español DD/MM/AAAA
 * Maneja valores nulos, vacíos o fechas inválidas devolviendo mensajes amigables
 */
export function formatDate(dateString) {
  if (!dateString) {
    return "Fecha no disponible";
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Normaliza un texto de búsqueda pasándolo a minúsculas y eliminando
 * los espacios en blanco innecesarios en los extremos.
 */
export function normalizeSearchTerm(text) {
  if (!text) {
    return "";
  }
  return text.trim().toLowerCase();
}