import { httpRequest } from "./httpClient";

// =============================================
// TRANSACCIONES
// =============================================

export function processPaymentRequest(paymentData) {
    return httpRequest("/api/v1/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
    });
}

// FIX: acepta { critical } para que OrdersPage pueda llamarlo con critical=false
// y así un 403 no provoque un redirect al login desde dentro de la página.
export function getPaymentByOrderRequest(orderNumber, { critical = true } = {}) {
    return httpRequest(`/api/v1/payments/order/${orderNumber}`, {
        method: "GET",
    }, { critical });
}

export function getPaymentsByCustomerRequest(customerEmail) {
    return httpRequest(`/api/v1/payments/customer/${encodeURIComponent(customerEmail)}`, {
        method: "GET",
    });
}

// Acepta { critical } siguiendo el mismo patrón que getPaymentByOrderRequest /
// getPaymentMethodsRequest: si algún caller no-admin llega a invocar esto,
// un 403 no debería forzar un logout (critical=false).
export function getAllPaymentsRequest({ critical = true } = {}) {
    return httpRequest("/api/v1/payments", {
        method: "GET",
    }, { critical });
}

// =============================================
// MÉTODOS DE PAGO (TARJETAS)
// =============================================

export function addPaymentMethodRequest(cardData) {
    return httpRequest("/api/v1/payments/methods", {
        method: "POST",
        body: JSON.stringify(cardData),
    });
}

// FIX: acepta { critical } — en OrdersPage se llama con critical=false porque
// un usuario con rol ORDERS puede no tener permisos sobre métodos de pago,
// y ese 403 no debe expulsar la sesión.
export function getPaymentMethodsRequest({ critical = true } = {}) {
    return httpRequest("/api/v1/payments/methods", {
        method: "GET",
    }, { critical });
}

export function deletePaymentMethodRequest(id) {
    return httpRequest(`/api/v1/payments/methods/${id}`, {
        method: "DELETE",
    });
}