package com.smartlogix.inventory.dto;
public class InventoryPriceResponse {
    private String sku;
    private String productName;
    private int availableQuantity;
    private double basePrice;
    private double finalPrice;
    private boolean hasDiscount;

    public InventoryPriceResponse(String sku, String productName, int availableQuantity, double basePrice, double finalPrice, boolean hasDiscount) {
        this.sku = sku;
        this.productName = productName;
        this.availableQuantity = availableQuantity;
        this.basePrice = basePrice;
        this.finalPrice = finalPrice;
        this.hasDiscount = hasDiscount;
    }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }

    public double getFinalPrice() { return finalPrice; }
    public void setFinalPrice(double finalPrice) { this.finalPrice = finalPrice; }

    public boolean isHasDiscount() { return hasDiscount; }
    public void setHasDiscount(boolean hasDiscount) { this.hasDiscount = hasDiscount; }
}
