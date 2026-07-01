package com.smartlogix.order.discount;

import java.math.BigDecimal;

public class FirstPurchaseDiscountStrategy implements DiscountStrategy {

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        return subtotal.multiply(BigDecimal.valueOf(0.05));
    }

    @Override
    public String getDescription() {
        return "Descuento de bienvenida (5%)";
    }
}