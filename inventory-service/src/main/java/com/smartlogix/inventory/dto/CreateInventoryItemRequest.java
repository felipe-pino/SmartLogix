package com.smartlogix.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateInventoryItemRequest(
        @NotBlank(message = "El SKU no puede estar vacío")
        String sku,
        @NotBlank(message = "El nombre del producto no puede estar vacío")
        String productName,
        @NotBlank(message = "El código de bodega no puede estar vacío")
        String warehouseCode,
        @Min(0) int initialQuantity,
        @Min(value = 0, message = "El nivel de reorden no puede ser negativo")
        int reorderLevel,
        @Min(value = 0, message = "La cantidad disponible no puede ser negativa")
        int availableQuantity,
        @NotNull(message = "El precio base es obligatorio")
        @Min(value = 0, message = "El precio base no puede ser negativo")
        double basePrice
) {
}
