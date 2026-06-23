package com.smartlogix.payment.service;

import com.smartlogix.payment.domain.PaymentStatus;
import com.smartlogix.payment.domain.PaymentTransaction;
import com.smartlogix.payment.dto.PaymentRequest;
import com.smartlogix.payment.dto.PaymentResponse;
import com.smartlogix.payment.exception.PaymentException;
import com.smartlogix.payment.repository.PaymentTransactionRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentTransactionRepository transactionRepository;
    private final OrderClient orderClient;

    public PaymentServiceImpl(PaymentTransactionRepository transactionRepository, OrderClient orderClient) {
        this.transactionRepository = transactionRepository;
        this.orderClient = orderClient;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {

        transactionRepository.findByOrderNumber(request.orderNumber())
                .filter(t -> t.getStatus() == PaymentStatus.COMPLETED)
                .ifPresent(t -> {
                    throw new PaymentException(
                            "La orden " + request.orderNumber() + " ya cuenta con un pago exitoso registrado."
                    );
                });

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderNumber(request.orderNumber());
        transaction.setCustomerEmail(request.customerEmail());
        transaction.setSavedCardToken(request.savedCardToken());
        transaction.setAmount(request.amount());
        transaction.setCurrency(request.currency() != null ? request.currency() : "USD");
        transaction.setLastFourDigits("4321");
        transaction.setCardBrand("VISA");

        boolean pagoRechazado = request.savedCardToken().endsWith("99");

        if (pagoRechazado) {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setFailureReason("Transacción rechazada por el banco emisor (fondos insuficientes).");

            try {
                transactionRepository.save(transaction);
            } catch (DataIntegrityViolationException e) {
                log.warn("Intento de pago duplicado detectado para la orden {}", request.orderNumber());
                throw new PaymentException(
                        "La orden " + request.orderNumber() + " ya tiene un pago en proceso. Intente nuevamente."
                );
            }

            notificarOrdenConFallo(request.orderNumber(), transaction.getFailureReason());
            return mapToResponse(transaction);
        }

        transaction.setStatus(PaymentStatus.COMPLETED);
        transaction.setGatewayTransactionId("ch_" + UUID.randomUUID().toString().substring(0, 12));

        PaymentTransaction savedTransaction;
        try {
            savedTransaction = transactionRepository.save(transaction);
        } catch (DataIntegrityViolationException e) {
            log.warn("Intento de pago duplicado detectado para la orden {}", request.orderNumber());
            throw new PaymentException(
                    "La orden " + request.orderNumber() + " ya tiene un pago en proceso. Intente nuevamente."
            );
        }

        try {
            orderClient.updateOrderStatus(request.orderNumber(), "APPROVED", null);
        } catch (FeignException e) {
            log.error(
                    "ALERTA: Pago COMPLETED para orden {} pero falló la notificación al order-service. " +
                            "GatewayTxId={}. Error: {}",
                    request.orderNumber(),
                    savedTransaction.getGatewayTransactionId(),
                    e.getMessage()
            );
        }

        return mapToResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderNumber(String orderNumber) {
        PaymentTransaction transaction = transactionRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new PaymentException(
                        "No se encontró ningún pago registrado para la orden: " + orderNumber
                ));
        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByCustomerEmail(String customerEmail) {
        List<PaymentTransaction> transactions =
                transactionRepository.findByCustomerEmailOrderByCreatedAtDesc(customerEmail);

        if (transactions.isEmpty()) {
            throw new PaymentException(
                    "No se encontraron pagos registrados para el cliente: " + customerEmail
            );
        }

        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void notificarOrdenConFallo(String orderNumber, String motivo) {
        try {
            orderClient.updateOrderStatus(orderNumber, "FAILED", motivo);
        } catch (FeignException e) {
            log.error(
                    "ALERTA: Pago FAILED para orden {} pero falló la notificación al order-service. Error: {}",
                    orderNumber,
                    e.getMessage()
            );
        }
    }

    private PaymentResponse mapToResponse(PaymentTransaction transaction) {
        return new PaymentResponse(
                transaction.getId(),
                transaction.getOrderNumber(),
                transaction.getStatus().name(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getGatewayTransactionId(),
                transaction.getFailureReason(),
                transaction.getCreatedAt()
        );
    }
}