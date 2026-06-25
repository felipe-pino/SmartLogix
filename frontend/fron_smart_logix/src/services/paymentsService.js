import {
    processPaymentRequest,
    getPaymentByOrderRequest,
    getPaymentsByCustomerRequest,
    getAllPaymentsRequest,
    addPaymentMethodRequest,
    getPaymentMethodsRequest,
    deletePaymentMethodRequest,
} from "../API/paymentApi";

// =============================================
// TRANSACCIONES
// =============================================

export async function processPayment(paymentData) {
    if (!paymentData.orderNumber) throw new Error("El número de orden es obligatorio.");
    if (!paymentData.customerEmail) throw new Error("El correo del cliente es obligatorio.");
    if (!paymentData.savedCardToken) throw new Error("El token de la tarjeta es obligatorio.");
    if (!paymentData.amount || Number(paymentData.amount) <= 0) throw new Error("El monto debe ser mayor a cero.");

    return await processPaymentRequest({
        ...paymentData,
        currency: paymentData.currency || "USD",
    });
}

// FIX: acepta { critical } y lo pasa hacia abajo para que desde OrdersPage
// se pueda usar getPaymentByOrder(num, { critical: false }) sin botar al usuario.
export async function getPaymentByOrder(orderNumber, { critical = true } = {}) {
    if (!orderNumber) throw new Error("El número de orden es requerido.");
    return await getPaymentByOrderRequest(orderNumber, { critical });
}

export async function getPaymentsByCustomer(customerEmail) {
    if (!customerEmail) throw new Error("El email del cliente es requerido.");
    return await getPaymentsByCustomerRequest(customerEmail);
}

export async function getAllPayments({ critical = true } = {}) {
    return await getAllPaymentsRequest({ critical });
}

// =============================================
// MÉTODOS DE PAGO (TARJETAS)
// =============================================

export async function addPaymentMethod(cardData) {
    if (!cardData.cardHolder) throw new Error("El nombre del titular es obligatorio.");
    if (!cardData.cardNumber) throw new Error("El número de tarjeta es obligatorio.");
    if (!cardData.expiryDate) throw new Error("La fecha de vencimiento es obligatoria.");
    if (!cardData.cvv) throw new Error("El CVV es obligatorio.");
    if (!cardData.type) throw new Error("El tipo de tarjeta es obligatorio.");
    return await addPaymentMethodRequest(cardData);
}

// FIX: acepta { critical } — necesario para OrdersPage, donde el usuario
// puede no tener permisos sobre métodos de pago y un 403 no debe cerrar su sesión.
export async function getPaymentMethods({ critical = true } = {}) {
    return await getPaymentMethodsRequest({ critical });
}

export async function deletePaymentMethod(id) {
    if (!id) throw new Error("El ID del método de pago es requerido.");
    return await deletePaymentMethodRequest(id);
}