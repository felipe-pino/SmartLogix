package com.smartlogix.payment.controller;

import com.smartlogix.payment.dto.PaymentMethodRequest;
import com.smartlogix.payment.dto.PaymentMethodResponse;
import com.smartlogix.payment.service.PaymentMethodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments/methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    // POST — Agregar método de pago (el userId viene del JWT, no del body)
    @PostMapping
    public ResponseEntity<PaymentMethodResponse> addPaymentMethod(
            @Valid @RequestBody PaymentMethodRequest request,
            Authentication authentication) {
        String userId = authentication.getName(); // "sub" del JWT = username
        PaymentMethodResponse response = paymentMethodService.addPaymentMethod(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET — Ver mis métodos de pago
    @GetMapping
    public ResponseEntity<List<PaymentMethodResponse>> getMyPaymentMethods(
            Authentication authentication) {
        String userId = authentication.getName();
        List<PaymentMethodResponse> response = paymentMethodService.getPaymentMethodsByUser(userId);
        return ResponseEntity.ok(response);
    }

    // DELETE — Eliminar un método de pago por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(
            @PathVariable Long id,
            Authentication authentication) {
        String userId = authentication.getName();
        paymentMethodService.deletePaymentMethod(id, userId);
        return ResponseEntity.noContent().build();
    }
}