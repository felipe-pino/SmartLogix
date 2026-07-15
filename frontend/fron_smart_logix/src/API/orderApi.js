import { httpRequest } from "./httpClient";

// Listar todas las órdenes
export function getOrdersRequest() {
  return httpRequest("/api/orders", { method: "GET" });
}

// NUEVO: Resumen de órdenes agrupadas por estado (ej: { "PENDING": 3, "APPROVED": 10 })
export function getOrderSummaryRequest() {
  return httpRequest("/api/orders/summary", { method: "GET" });
}

// Crear una nueva orden
export function createOrderRequest(orderData) {
  return httpRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  });
}

// MODIFICADO: Apunta directo al recurso principal sin el "/status" al final y SIN .toUpperCase()
export function updateOrderStatusRequest(orderNumber, statusData) {
  const cleanOrderNumber = String(orderNumber).trim();

  return httpRequest(`/api/orders/${cleanOrderNumber}`, {
    method: "PATCH",
    body: JSON.stringify(statusData)
  });
}

// Eliminar una orden (SIN .toUpperCase())
export function deleteOrderRequest(orderNumber) {
  const cleanOrderNumber = String(orderNumber).trim();

  return httpRequest(`/api/orders/${cleanOrderNumber}`, {
    method: "DELETE"
  });
}