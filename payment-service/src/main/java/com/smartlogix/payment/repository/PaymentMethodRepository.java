package com.smartlogix.payment.repository;

import com.smartlogix.payment.domain.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    // Listar todas las tarjetas de un usuario
    List<PaymentMethod> findAllByUserId(String userId);

    // Buscar por token (usado al procesar pagos)
    Optional<PaymentMethod> findByToken(String token);

    // Verificar si ya existe una tarjeta con ese token
    boolean existsByToken(String token);
}