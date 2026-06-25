package com.smartlogix.inventory.dto;

import java.math.BigDecimal; // AGREGADO
import java.time.OffsetDateTime;

public record InventoryItemResponse(
        String sku,
        String productName,
        String warehouseCode,
        int availableQuantity,
        int reservedQuantity,
        int reorderLevel,
        BigDecimal price, // AGREGADO
        OffsetDateTime updatedAt
) {
}