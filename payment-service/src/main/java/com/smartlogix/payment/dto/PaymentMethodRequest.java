package com.smartlogix.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PaymentMethodRequest(

        @NotBlank(message = "El nombre del titular es obligatorio")
        @Size(max = 100)
        String cardHolder,

        @NotBlank(message = "El número de tarjeta es obligatorio")
        @Size(min = 16, max = 16, message = "El número de tarjeta debe tener 16 dígitos")
        String cardNumber,

        @NotBlank(message = "La fecha de vencimiento es obligatoria")
        @Pattern(regexp = "^\\d{2}/\\d{2}$", message = "Formato inválido. Use MM/AA")
        String expiryDate,

        @NotBlank(message = "El CVV es obligatorio")
        @Size(min = 3, max = 3, message = "El CVV debe tener 3 dígitos")
        String cvv,

        // CREDIT o DEBIT
        @NotBlank(message = "El tipo de tarjeta es obligatorio")
        String type
) {}