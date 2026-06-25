// FIX: ruta corregida de "../api/inventoryApi" a "../API/inventoryApi" (mayúscula)
// En Linux/Docker el sistema de archivos es case-sensitive y el build fallaba silenciosamente en producción.
import { getInventoryRequest, updateInventoryItemRequest, deleteInventoryItemRequest } from "../API/inventoryApi";

/**
 * Recupera el listado completo de productos en inventario.
 */
export async function getInventory() {
  return await getInventoryRequest();
}

/**
 * Actualiza un producto en inventario validando restricciones de stock logístico.
 */
export async function updateInventoryItem(sku, itemData) {
  if (!sku || !sku.trim()) {
    throw new Error("El código SKU es obligatorio para actualizar el ítem.");
  }
  if (!itemData) {
    throw new Error("No se proporcionaron datos para actualizar.");
  }

  // REGLA DE NEGOCIO CRÍTICA: No permitir stock negativo en el sistema logístico inteligente
  if (itemData.availableQuantity !== undefined && itemData.availableQuantity < 0) {
    throw new Error("La cantidad disponible en inventario no puede ser un número negativo.");
  }

  if (itemData.productName && !itemData.productName.trim()) {
    throw new Error("El nombre del producto no puede transformarse en un texto vacío.");
  }

  return await updateInventoryItemRequest(sku, itemData);
}

/**
 * Elimina un producto del inventario.
 */
export async function deleteInventoryItem(sku) {
  if (!sku || !sku.trim()) {
    throw new Error("El código SKU es obligatorio para eliminar el ítem.");
  }
  return await deleteInventoryItemRequest(sku);
}