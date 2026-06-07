import { httpRequest } from "./httpClient";

export function loginRequest({ credential, password }) {
  return httpRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ credential, password })
  });
}

// ========================================================
// NUEVA PETICIÓN DE RED PARA EL REGISTRO PERSONAL (CORREGIDA PARA SPRING BOOT)
// ========================================================
export function registerRequest({ username, email, password }) {
  return httpRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password })
  });
}

export function getAllUsersRequest() {
  return httpRequest("/api/auth/users", { method: "GET" });
}

export function getUserByIdRequest(id) {
  return httpRequest(`/api/auth/users/${id}`, { method: "GET" });
}

export function updateUserRequest(id, userData) {
  return httpRequest(`/api/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData)
  });
}

export function deleteUserRequest(id) {
  return httpRequest(`/api/auth/users/${id}`, { method: "DELETE" });
}

// Agrega esto en tu src/api/authApi.js si no lo tienes:
export function getAvailableRolesRequest() {
  return httpRequest("/api/auth/roles", { method: "GET" });
}