package com.smartlogix.payment.service;

import com.smartlogix.payment.dto.PaymentMethodRequest;
import com.smartlogix.payment.dto.PaymentMethodResponse;

import java.util.List;

public interface PaymentMethodService {
    PaymentMethodResponse addPaymentMethod(PaymentMethodRequest request, String userId);
    List<PaymentMethodResponse> getPaymentMethodsByUser(String userId);
    void deletePaymentMethod(Long id, String userId);
}