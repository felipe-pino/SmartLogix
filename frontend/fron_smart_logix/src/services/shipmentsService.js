import { getShipmentsRequest, updateShipmentRequest, updateShipmentStatusRequest, deleteShipmentRequest } from "../API/shipmentApi";

/**
 * Obtiene el listado de todos los despachos y rutas de transporte.
 */
export async function getShipments() {
  return await getShipmentsRequest();
}

/**
 * Actualiza la información general de logística de un envío.
 */
export async function updateShipment(trackingCode, shipmentData) {
  if (!trackingCode || !trackingCode.trim()) {
    throw new Error("El código de seguimiento (trackingCode) es requerido.");
  }
  if (!shipmentData) {
    throw new Error("Los datos de actualización del envío no pueden estar vacíos.");
  }

  return await updateShipmentRequest(trackingCode, shipmentData);
}

/**
 * Modifica el estado de tránsito de un envío sanitizando la entrada del usuario.
 */
export async function updateShipmentStatus(trackingCode, statusValue) {
  if (!trackingCode || !trackingCode.trim()) {
    throw new Error("El código de seguimiento es indispensable para actualizar el estado.");
  }

  // REGLA DE NEGOCIO: Impedir cadenas vacías o accidentales enviadas por la interfaz
  if (!statusValue || !statusValue.trim()) {
    throw new Error("El nuevo estado del envío es requerido y no puede consistir solo de espacios.");
  }

  return await updateShipmentStatusRequest(trackingCode, statusValue.trim());
}

/**
 * Elimina o destruye el registro de un despacho mediante su código de seguimiento.
 */
export async function deleteShipment(trackingCode) {
  if (!trackingCode || !trackingCode.trim()) {
    throw new Error("Código de seguimiento requerido para eliminar el registro de despacho.");
  }
  return await deleteShipmentRequest(trackingCode);
}