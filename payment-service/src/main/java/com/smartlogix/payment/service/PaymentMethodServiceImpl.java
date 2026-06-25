package com.smartlogix.payment.service;

import com.smartlogix.payment.domain.CardBrand;
import com.smartlogix.payment.domain.PaymentMethod;
import com.smartlogix.payment.domain.PaymentType;
import com.smartlogix.payment.dto.PaymentMethodRequest;
import com.smartlogix.payment.dto.PaymentMethodResponse;
import com.smartlogix.payment.exception.PaymentException;
import com.smartlogix.payment.repository.PaymentMethodRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private static final Logger log = LoggerFactory.getLogger(PaymentMethodServiceImpl.class);

    private final PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodServiceImpl(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }

    @Override
    @Transactional
    public PaymentMethodResponse addPaymentMethod(PaymentMethodRequest request, String userId) {

        // Validar algoritmo de Luhn
        if (!isValidLuhn(request.cardNumber())) {
            throw new PaymentException("El número de tarjeta no es válido.");
        }

        // Un usuario solo puede tener una tarjeta por ahora
        List<PaymentMethod> existing = paymentMethodRepository.findAllByUserId(userId);
        if (!existing.isEmpty()) {
            throw new PaymentException("Ya tienes un método de pago registrado. Elimínalo antes de agregar uno nuevo.");
        }

        // Detectar marca según primer dígito
        CardBrand brand = detectBrand(request.cardNumber());

        // Generar token simulado — nunca se guarda el número real
        String token = "tok_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        PaymentMethod method = new PaymentMethod();
        method.setUserId(userId);
        method.setCardHolder(request.cardHolder().trim().toUpperCase());
        method.setLastFourDigits(request.cardNumber().substring(12));
        method.setExpiryDate(request.expiryDate());
        method.setBrand(brand);
        method.setType(PaymentType.valueOf(request.type().toUpperCase()));
        method.setToken(token);
        method.setDefaultCard(true);

        PaymentMethod saved = paymentMethodRepository.save(method);
        log.info("Método de pago registrado para usuario {} — últimos 4: {}", userId, saved.getLastFourDigits());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getPaymentMethodsByUser(String userId) {
        return paymentMethodRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePaymentMethod(Long id, String userId) {
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Método de pago no encontrado con ID: " + id));

        if (!method.getUserId().equals(userId)) {
            throw new PaymentException("No tienes permiso para eliminar este método de pago.");
        }

        paymentMethodRepository.delete(method);
        log.info("Método de pago {} eliminado por usuario {}", id, userId);
    }

    // Algoritmo de Luhn
    private boolean isValidLuhn(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Character.getNumericValue(cardNumber.charAt(i));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    // Detección de marca por primer dígito
    private CardBrand detectBrand(String cardNumber) {
        if (cardNumber.startsWith("4")) return CardBrand.VISA;
        if (cardNumber.startsWith("5")) return CardBrand.MASTERCARD;
        if (cardNumber.startsWith("3")) return CardBrand.AMEX;
        return CardBrand.UNKNOWN;
    }

    private PaymentMethodResponse mapToResponse(PaymentMethod method) {
        return new PaymentMethodResponse(
                method.getId(),
                method.getCardHolder(),
                method.getLastFourDigits(),
                method.getBrand().name(),
                method.getType().name(),
                method.getExpiryDate(),
                method.getToken(),
                method.isDefaultCard(),
                method.getCreatedAt()
        );
    }
}