package com.smartlogix.payment.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", path = "/api/v1/orders")
public interface OrderClient {

    @PutMapping("/{orderNumber}/status")
    void updateOrderStatus(
            @PathVariable("orderNumber") String orderNumber,
            @RequestParam("status") String status,
            @RequestParam(value = "rejectionReason", required = false) String rejectionReason
    );
}