package com.smartlogix.payment.dto;

import java.time.OffsetDateTime;

public record PaymentMethodResponse(
        Long id,
        String cardHolder,
        String lastFourDigits,
        String brand,
        String type,
        String expiryDate,
        String token,
        boolean isDefault,
        OffsetDateTime createdAt
) {}