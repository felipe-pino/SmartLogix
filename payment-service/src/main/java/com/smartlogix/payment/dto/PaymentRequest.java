package com.smartlogix.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PaymentRequest(
        @NotBlank(message = "El número de orden es obligatorio")
        @Size(max = 50)
        String orderNumber,

        @NotBlank(message = "El correo del cliente es obligatorio")
        String customerEmail,

        @NotBlank(message = "El token de la tarjeta guardada es obligatorio")
        String savedCardToken,

        @NotNull(message = "El monto es obligatorio")
        BigDecimal amount,

        String currency
) {}