package com.smartlogix.order.discount;

import java.math.BigDecimal;

public class FrequentCustomerDiscountStrategy implements DiscountStrategy {

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        return subtotal.multiply(BigDecimal.valueOf(0.10));
    }

    @Override
    public String getDescription() {
        return "Descuento de cliente frecuente (10%)";
    }
}