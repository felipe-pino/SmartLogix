package com.smartlogix.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(
        name = "payment_transactions",
        uniqueConstraints = @UniqueConstraint(name = "uk_payment_order_number", columnNames = "orderNumber")
)
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CORREGIDO: unique = true a nivel de columna Y constraint a nivel de tabla
    // Esto previene doble cobro por condición de carrera concurrente
    @Column(nullable = false, length = 50, unique = true)
    private String orderNumber;

    @Column(nullable = false, length = 120)
    private String customerEmail;

    @Column(nullable = false, length = 100)
    private String savedCardToken;

    @Column(nullable = false, length = 4)
    private String lastFourDigits;

    @Column(nullable = false, length = 30)
    private String cardBrand;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(length = 100)
    private String gatewayTransactionId;

    @Column(length = 250)
    private String failureReason;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        if (this.currency == null) {
            this.currency = "USD";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getSavedCardToken() { return savedCardToken; }
    public void setSavedCardToken(String savedCardToken) { this.savedCardToken = savedCardToken; }

    public String getLastFourDigits() { return lastFourDigits; }
    public void setLastFourDigits(String lastFourDigits) { this.lastFourDigits = lastFourDigits; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}