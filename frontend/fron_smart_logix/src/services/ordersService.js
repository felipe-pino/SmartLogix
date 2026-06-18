import { getOrdersRequest, updateOrderStatusRequest, deleteOrderRequest } from "../api/orderApi";

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

  // REGLA DE NEGOCIO: Validar que el estado enviado coincida estrictamente con los del dominio backend
  const estadosValidos = ["PENDING", "PROCESSED", "SHIPPED", "DELIVERED", "CANCELLED", "APPROVED", "SHIPMENT_REQUESTED", "FAILED"];
  const estadoNormalizado = statusDto.status.toUpperCase().trim();

  if (!estadosValidos.includes(estadoNormalizado)) {
    throw new Error(`Estado inválido. Debe corresponder a uno de los siguientes: ${estadosValidos.join(", ")}`);
  }

  // Enviamos los datos normalizados
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