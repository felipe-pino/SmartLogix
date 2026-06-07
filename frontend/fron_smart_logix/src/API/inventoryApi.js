import { httpRequest } from "./httpClient";

// Listar todo el inventario
export function getInventoryRequest() {
  return httpRequest("/api/inventory/items", { method: "GET" });
}

// Crear un nuevo producto en inventario
export function createInventoryItemRequest(itemData) {
  return httpRequest("/api/inventory/items", {
    method: "POST",
    body: JSON.stringify(itemData)
  });
}

// ACTUALIZAR (PUT): Modificar un producto existente
export function updateInventoryItemRequest(sku, itemData) {
  const cleanSku = String(sku).trim().toUpperCase();
  return httpRequest(`/api/inventory/items/${cleanSku}`, {
    method: "PUT",
    body: JSON.stringify(itemData)
  });
}

// ELIMINAR (DELETE): Borrar un producto del sistema
export function deleteInventoryItemRequest(sku) {
  const cleanSku = String(sku).trim().toUpperCase();
  return httpRequest(`/api/inventory/items/${cleanSku}`, { 
    method: "DELETE" 
  });
}