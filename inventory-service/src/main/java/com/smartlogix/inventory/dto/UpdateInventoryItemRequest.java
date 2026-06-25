package com.smartlogix.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal; // AGREGADO

public record UpdateInventoryItemRequest(
        @NotBlank(message = "El nombre del producto es obligatorio")
        String productName,

        @Min(value = 0, message = "La cantidad disponible no puede ser negativa")
        int availableQuantity,

        @Min(value = 0, message = "La cantidad reservada no puede ser negativa")
        int reservedQuantity,

        @Min(value = 0, message = "El nivel de reorden no puede ser negativo")
        int reorderLevel,

        @NotNull(message = "El precio es obligatorio") // AGREGADO
        @DecimalMin(value = "0.0", message = "El precio no puede ser negativo") // AGREGADO
        BigDecimal price
) {
}