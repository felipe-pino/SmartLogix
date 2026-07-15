package com.smartlogix.order.controller;

import com.smartlogix.order.dto.CreateOrderRequest;
import com.smartlogix.order.dto.OrderResponse;
import com.smartlogix.order.dto.UpdateOrderStatusRequest;
import com.smartlogix.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // Roles que pueden administrar órdenes (igual que en el frontend)
    private static final String ORDER_MANAGEMENT_ROLES = "hasAnyRole('ADMIN','ORDER_MANAGER')";

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<OrderResponse> listOrders() {
        return orderService.getOrders();
    }

    // ==========================================
    //       NUEVO ENDPOINT: RESUMEN POR ESTADO
    //       IMPORTANTE: debe ir ANTES de /{orderNumber}
    //       para que Spring no interprete "summary"
    //       como si fuera un número de orden.
    // ==========================================
    @GetMapping("/summary")
    public Map<String, Long> getSummary() {
        return orderService.getOrderStatusSummary();
    }

    @GetMapping("/{orderNumber}")
    public OrderResponse findByOrderNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByNumber(orderNumber);
    }

    // ==========================================
    //       ENDPOINTS AGREGADOS PARA EL CRUD
    // ==========================================

    // MODIFICADO: Se elimina "/status" para usar la ruta raíz del recurso de la orden
    @PatchMapping("/{orderNumber}")
    @PreAuthorize(ORDER_MANAGEMENT_ROLES)
    public OrderResponse updateStatus(
            @PathVariable String orderNumber,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(orderNumber, request);
    }

    @DeleteMapping("/{orderNumber}")
    @PreAuthorize(ORDER_MANAGEMENT_ROLES)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String orderNumber) {
        orderService.deleteOrder(orderNumber);
    }
}