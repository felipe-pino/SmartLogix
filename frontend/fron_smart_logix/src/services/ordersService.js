// FIX: ruta corregida de "../api/orderApi" a "../API/orderApi" (mayúscula)
// En Linux/Docker el sistema de archivos es case-sensitive y el build fallaba.
import { getOrdersRequest, updateOrderStatusRequest, deleteOrderRequest, createOrderRequest } from "../API/orderApi";

/**
 * Crea una nueva orden de compra en el sistema.
 */
export async function createOrder(orderData) {
  if (!orderData || !orderData.lines || orderData.lines.length === 0) {
    throw new Error("La orden debe contener al menos un producto.");
  }
  return await createOrderRequest(orderData);
}

/**
 * Recupera todas las órdenes de compra registradas en el sistema.
 */
export async function getOrders() {
  return await getOrdersRequest();
}

/**
 * Cambia el estado de una orden controlando que pertenezca a la máquina de estados del negocio.
 */
export async function updateOrderStatus(orderNumber, statusDto) {
  if (!orderNumber) {
    throw new Error("El número de orden es obligatorio para modificar su estado.");
  }
  if (!statusDto || !statusDto.status) {
    throw new Error("El objeto de estado de la orden es requerido.");
  }

  const estadosValidos = ["PENDING", "PROCESSED", "SHIPPED", "DELIVERED", "CANCELLED", "APPROVED", "SHIPMENT_REQUESTED", "FAILED"];
  const estadoNormalizado = statusDto.status.toUpperCase().trim();

  if (!estadosValidos.includes(estadoNormalizado)) {
    throw new Error(`Estado inválido. Debe corresponder a uno de los siguientes: ${estadosValidos.join(", ")}`);
  }

  return await updateOrderStatusRequest(orderNumber, { status: estadoNormalizado });
}

/**
 * Cancela o remueve una orden del flujo de trabajo de la cadena.
 */
export async function deleteOrder(orderNumber) {
  if (!orderNumber) {
    throw new Error("El número de orden es mandatorio para eliminar el registro.");
  }
  return await deleteOrderRequest(orderNumber);
}