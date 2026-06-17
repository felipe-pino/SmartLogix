package com.smartlogix.inventory.strategy;
public class LowRotationDiscountStrategy implements PriceStrategy {
    private final double discountPercentage;

    public LowRotationDiscountStrategy(double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    @Override
    public double calculatePrice(double basePrice) {
        return basePrice * (1.0 - (discountPercentage / 100.0));
    }
}