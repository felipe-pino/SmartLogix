package com.smartlogix.payment.repository;

import com.smartlogix.payment.domain.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderNumber(String orderNumber);

    // Para el historial por cliente
    List<PaymentTransaction> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
}