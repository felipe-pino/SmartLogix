package com.smartlogix.payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Long id,
        String orderNumber,
        String status,
        BigDecimal amount,
        String currency,
        String gatewayTransactionId,
        String failureReason,
        OffsetDateTime createdAt
) {}