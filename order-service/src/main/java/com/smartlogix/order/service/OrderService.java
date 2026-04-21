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
import com.smartlogix.order.exception.OrderNotFoundException;
import com.smartlogix.order.repository.PurchaseOrderRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID; // Import necesario para el ID de la orden
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
        // 1. Creamos la orden con los datos del request
        PurchaseOrder order = new PurchaseOrder();
        // Generamos un numero de orden simple para que no de error
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8));
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setShippingAddress(request.shippingAddress());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(calculateTotal(request.lines()));

        // 2. Procesamos las líneas y reservamos stock
        for (OrderLineRequest lineReq : request.lines()) {
            // Llamada al cliente de inventario (aquí estaba el hueco)
            inventoryClient.reserve(lineReq.sku(), lineReq.quantity());

            OrderLine line = new OrderLine();
            line.setSku(lineReq.sku());
            line.setQuantity(lineReq.quantity());
            line.setUnitPrice(lineReq.unitPrice());
            order.addLine(line);
        }

        // 3. Cambiamos estado y guardamos por primera vez
        order.setStatus(OrderStatus.APPROVED);
        PurchaseOrder savedOrder = repository.save(order);

        // 4. Intentamos solicitar el despacho
        try {
            ShipmentRequest shipRequest = new ShipmentRequest(
                    savedOrder.getOrderNumber(),
                    savedOrder.getShippingAddress(),
                    totalUnits(savedOrder)
            );

            ShipmentResponse shipResponse = shipmentClient.requestShipment(shipRequest);

            // Si el cliente nos devuelve un tracking, lo guardamos
            if (shipResponse.trackingCode() != null) {
                savedOrder.setTrackingCode(shipResponse.trackingCode());
                savedOrder.setStatus(OrderStatus.SHIPMENT_REQUESTED);
            }
        } catch (Exception e) {
            // Si falla el despacho, marcamos la orden pero no la borramos
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