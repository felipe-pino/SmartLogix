import { httpRequest } from "./httpClient";

export function getShipmentsRequest() {
  return httpRequest("/api/shipments", { method: "GET" });
}

export function createShipmentRequest(shipmentData) {
  return httpRequest("/api/shipments", {
    method: "POST",
    body: JSON.stringify(shipmentData)
  });
}

// CORREGIDO: Se cambia a PATCH porque tu Java usa @PatchMapping("/{trackingCode}")
export function updateShipmentRequest(trackingCode, shipmentData) {
  return httpRequest(`/api/shipments/${trackingCode}`, {
    method: "PATCH",
    body: JSON.stringify(shipmentData)
  });
}

// CORREGIDO: Se cambia "?status=" por "?value=" porque tu Java usa @RequestParam("value")
export function updateShipmentStatusRequest(trackingCode, statusValue) {
  return httpRequest(`/api/shipments/${trackingCode}/status?value=${statusValue}`, {
    method: "PATCH"
  });
}

export function deleteShipmentRequest(trackingCode) {
  return httpRequest(`/api/shipments/${trackingCode}`, { method: "DELETE" });
}