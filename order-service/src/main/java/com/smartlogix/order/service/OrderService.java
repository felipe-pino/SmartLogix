package com.smartlogix.order.service;

import com.smartlogix.order.client.InventoryClient;
import com.smartlogix.order.client.InventoryClientException;
import com.smartlogix.order.client.ShipmentClient;
import com.smartlogix.order.client.ShipmentRequest;
import com.smartlogix.order.client.ShipmentResponse;
import com.smartlogix.order.domain.OrderLine;
import com.smartlogix.order.domain.OrderStatus;
import com.smartlogix.order.domain.PurchaseOrder;
import com.smartlogix.order.dto.CreateOrderRequest;
import com.smartlogix.order.dto.OrderLineRequest;
import com.smartlogix.order.dto.OrderLineResponse;
import com.smartlogix.order.dto.OrderResponse;
import com.smartlogix.order.dto.UpdateOrderStatusRequest;
import com.smartlogix.order.exception.OrderNotFoundException;
import com.smartlogix.order.repository.PurchaseOrderRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

    private final PurchaseOrderRepository repository;
    private final InventoryClient inventoryClient;
    private final ShipmentClient shipmentClient;

    public OrderService(
            PurchaseOrderRepository repository,
            InventoryClient inventoryClient,
            ShipmentClient shipmentClient
    ) {
        this.repository = repository;
        this.inventoryClient = inventoryClient;
        this.shipmentClient = shipmentClient;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setShippingAddress(request.shippingAddress());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAcumulado = BigDecimal.ZERO;

        for (OrderLineRequest lineReq : request.lines()) {
            // 1. Verificar disponibilidad física real
            inventoryClient.checkAvailability(lineReq.sku(), lineReq.quantity());

            // 2. APLICACIÓN PROPUESTA 2: Lógica de precio dinámico por escasez
            BigDecimal precioFinal = lineReq.unitPrice();
            try {
                InventoryClient.InventoryItemResponse inventoryData = inventoryClient.getItemBySku(lineReq.sku());
                if (inventoryData != null && inventoryData.getAvailableQuantity() <= inventoryData.getReorderLevel()) {
                    // Si el stock disponible cayó al nivel crítico o menor, se recarga el 20%
                    precioFinal = precioFinal.multiply(BigDecimal.valueOf(1.20));
                }
            } catch (Exception e) {
                System.err.println("No se pudo obtener el precio dinámico para el SKU " + lineReq.sku() + ". Usando precio base.");
            }

            // 3. Reservar en inventario
            inventoryClient.reserve(lineReq.sku(), lineReq.quantity());

            // 4. Construir y asociar la línea de la orden
            OrderLine line = new OrderLine();
            line.setSku(lineReq.sku());
            line.setQuantity(lineReq.quantity());
            line.setUnitPrice(precioFinal);
            order.addLine(line);

            // Calcular el total de la línea basándonos en el precio final recalculado
            BigDecimal totalLinea = precioFinal.multiply(BigDecimal.valueOf(lineReq.quantity()));
            totalAcumulado = totalAcumulado.add(totalLinea);
        }

        // Fijamos el total de la orden con el acumulado dinámico
        order.setTotalAmount(totalAcumulado);
        order.setStatus(OrderStatus.APPROVED);
        PurchaseOrder savedOrder = repository.save(order);

        try {
            ShipmentRequest shipRequest = new ShipmentRequest(
                    savedOrder.getOrderNumber(),
                    savedOrder.getShippingAddress(),
                    totalUnits(savedOrder)
            );

            ShipmentResponse shipResponse = shipmentClient.requestShipment(shipRequest);

            if (shipResponse.trackingCode() != null) {
                savedOrder.setTrackingCode(shipResponse.trackingCode());
                savedOrder.setStatus(OrderStatus.SHIPMENT_REQUESTED);
            }
        } catch (Exception e) {
            savedOrder.setStatus(OrderStatus.FAILED);
            savedOrder.setRejectionReason("Error en Shipment: " + e.getMessage());
        }

        return toResponse(repository.save(savedOrder));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        return repository.findByOrderNumber(orderNumber)
                .map(this::toResponse)
                .orElseThrow(() -> new OrderNotFoundException("Orden no encontrada: " + orderNumber));
    }

    public OrderResponse updateOrderStatus(String orderNumber, UpdateOrderStatusRequest request) {
        PurchaseOrder order = repository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Orden no encontrada: " + orderNumber));

        order.setStatus(request.status());

        if (request.trackingCode() != null && !request.trackingCode().isBlank()) {
            order.setTrackingCode(request.trackingCode());
        }

        if (request.reason() != null && !request.reason().isBlank()) {
            order.setRejectionReason(request.reason());
        }

        return toResponse(repository.save(order));
    }

    public void deleteOrder(String orderNumber) {
        PurchaseOrder order = repository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Orden no encontrada: " + orderNumber));
        repository.delete(order);
    }

    // ==========================================
    //       MÉTODOS PRIVADOS (INTACTOS)
    // ==========================================

    private BigDecimal calculateTotal(List<OrderLineRequest> lines) {
        return lines.stream()
                .map(line -> line.unitPrice().multiply(BigDecimal.valueOf(line.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int totalUnits(PurchaseOrder order) {
        return order.getLines().stream().mapToInt(OrderLine::getQuantity).sum();
    }

    private OrderResponse toResponse(PurchaseOrder order) {
        List<OrderLineResponse> lines = order.getLines().stream()
                .map(line -> new OrderLineResponse(
                        line.getSku(),
                        line.getQuantity(),
                        line.getUnitPrice(),
                        line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()))
                ))
                .toList();

        return new OrderResponse(
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getTrackingCode(),
                order.getRejectionReason(),
                order.getCreatedAt(),
                lines
        );
    }
}