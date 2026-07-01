package com.smartlogix.order.discount;

import java.math.BigDecimal;

public interface DiscountStrategy {
    BigDecimal calculateDiscount(BigDecimal subtotal);
    String getDescription();
}