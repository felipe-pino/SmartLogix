package com.smartlogix.inventory.strategy;

public class NormalPriceStrategy implements PriceStrategy {
    @Override
    public double calculatePrice(double basePrice) {
        return basePrice;
    }
}