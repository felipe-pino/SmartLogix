package com.smartlogix.inventory.strategy;

import com.smartlogix.inventory.domain.InventoryItem;

public interface DiscountStrategy {
    boolean isApplicable(InventoryItem item);
    double calculateDiscountedPrice(InventoryItem item);
}