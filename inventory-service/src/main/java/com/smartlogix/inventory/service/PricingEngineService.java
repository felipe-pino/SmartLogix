package com.smartlogix.inventory.service;

import com.smartlogix.inventory.domain.InventoryItem;
import com.smartlogix.inventory.strategy.DiscountStrategy;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PricingEngineService {

    private final List<DiscountStrategy> discountStrategies;

    // Spring inyecta de forma automática todas las clases que implementen la interfaz DiscountStrategy
    public PricingEngineService(List<DiscountStrategy> discountStrategies) {
        this.discountStrategies = discountStrategies;
    }

    /**
     * Evalúa el artículo contra las estrategias activas.
     * Retorna el precio calculado por la primera estrategia que aplique, o el precio base si ninguna aplica.
     */
    public double calculateDynamicPrice(InventoryItem item) {
        return discountStrategies.stream()
                .filter(strategy -> strategy.isApplicable(item))
                .findFirst()
                .map(strategy -> strategy.calculateDiscountedPrice(item))
                .orElse(item.getBasePrice());
    }

    /**
     * Comprueba si el artículo cumple con los criterios de alguna regla de descuento.
     */
    public boolean hasActiveDiscount(InventoryItem item) {
        return discountStrategies.stream()
                .anyMatch(strategy -> strategy.isApplicable(item));
    }
}