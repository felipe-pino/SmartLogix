package com.smartlogix.order.discount;

import org.springframework.stereotype.Component;

@Component
public class DiscountStrategyResolver {

    public DiscountStrategy resolve(long previousOrdersCount) {
        if (previousOrdersCount >= 3) {
            return new FrequentCustomerDiscountStrategy();
        }
        if (previousOrdersCount == 0) {
            return new FirstPurchaseDiscountStrategy();
        }
        return new NoDiscountStrategy();
    }
}