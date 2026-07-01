package com.smartlogix.order.repository;

import com.smartlogix.order.domain.OrderStatus;
import com.smartlogix.order.domain.PurchaseOrder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    // Solo cuenta órdenes "válidas" del cliente (excluye FAILED/REJECTED)
    // para que un historial de compras fallidas no otorgue descuento de fidelidad.
    long countByCustomerEmailAndStatusNotIn(String customerEmail, List<OrderStatus> excludedStatuses);
}