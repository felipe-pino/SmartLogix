package com.smartlogix.shipment.dto;

import com.smartlogix.shipment.domain.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateShipmentRequest(
        @NotNull(message = "El estado del envío es obligatorio")
        ShipmentStatus status,

        String carrier,

        String routeCode,

        LocalDate estimatedDeliveryDate
) {
}