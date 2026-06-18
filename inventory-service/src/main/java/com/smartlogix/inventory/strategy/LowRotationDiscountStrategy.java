package com.smartlogix.inventory.strategy;

import com.smartlogix.inventory.domain.InventoryItem;
import org.springframework.stereotype.Component;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class LowRotationDiscountStrategy implements DiscountStrategy {

    private static final int STAGNATION_DAYS_THRESHOLD = 30;
    private static final double DISCOUNT_PERCENTAGE = 0.20;

    @Override
    public boolean isApplicable(InventoryItem item) {
        long daysStagnant = ChronoUnit.DAYS.between(item.getLastMovementDate(), OffsetDateTime.now());
        return daysStagnant > STAGNATION_DAYS_THRESHOLD && item.getAvailableQuantity() > 10;
    }

    @Override
    public double calculateDiscountedPrice(InventoryItem item) {
        return item.getBasePrice() * (1.0 - DISCOUNT_PERCENTAGE);
    }
}