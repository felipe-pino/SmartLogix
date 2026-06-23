package com.smartlogix.payment.service;

import com.smartlogix.payment.dto.PaymentRequest;
import com.smartlogix.payment.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByOrderNumber(String orderNumber);

    // Historial de pagos de un cliente específico (por su email)
    List<PaymentResponse> getPaymentsByCustomerEmail(String customerEmail);

    // Listado completo de todos los pagos — solo ADMIN
    List<PaymentResponse> getAllPayments();
}