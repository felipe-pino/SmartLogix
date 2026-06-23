package com.smartlogix.payment.controller;

import com.smartlogix.payment.dto.PaymentRequest;
import com.smartlogix.payment.dto.PaymentResponse;
import com.smartlogix.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Procesar un nuevo pago
    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Consultar pago por número de orden (cualquier usuario autenticado)
    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderNumber(@PathVariable String orderNumber) {
        PaymentResponse response = paymentService.getPaymentByOrderNumber(orderNumber);
        return ResponseEntity.ok(response);
    }

    // Historial de pagos de un cliente por su email (cualquier usuario autenticado)
    // El front puede llamar esto pasando el email del usuario logueado
    @GetMapping("/customer/{customerEmail}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByCustomerEmail(
            @PathVariable String customerEmail) {
        List<PaymentResponse> response = paymentService.getPaymentsByCustomerEmail(customerEmail);
        return ResponseEntity.ok(response);
    }

    // Listado completo — solo ROLE_ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> response = paymentService.getAllPayments();
        return ResponseEntity.ok(response);
    }
}