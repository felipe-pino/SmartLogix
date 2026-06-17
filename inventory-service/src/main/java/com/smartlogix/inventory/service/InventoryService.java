package com.smartlogix.inventory.service;

import com.smartlogix.inventory.domain.InventoryItem;
import com.smartlogix.inventory.dto.CreateInventoryItemRequest;
import com.smartlogix.inventory.dto.UpdateInventoryItemRequest;
import com.smartlogix.inventory.dto.InventoryAvailabilityResponse;
import com.smartlogix.inventory.dto.InventoryItemResponse;
import com.smartlogix.inventory.dto.InventoryPriceResponse;
import com.smartlogix.inventory.exception.InventoryNotFoundException;
import com.smartlogix.inventory.exception.InventoryOperationException;
import com.smartlogix.inventory.repository.InventoryItemRepository;
import com.smartlogix.inventory.strategy.LowRotationDiscountStrategy;
import com.smartlogix.inventory.strategy.NormalPriceStrategy;
import com.smartlogix.inventory.strategy.PriceStrategy;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {

    private final InventoryItemRepository repository;

    public InventoryService(InventoryItemRepository repository) {
        this.repository = repository;
    }

    public InventoryItemResponse createItem(CreateInventoryItemRequest request) {
        if (repository.existsBySku(request.sku())) {
            throw new InventoryOperationException("El SKU ya existe: " + request.sku());
        }

        InventoryItem item = new InventoryItem();
        item.setSku(request.sku().trim().toUpperCase());
        item.setProductName(request.productName().trim());
        item.setWarehouseCode(request.warehouseCode().trim().toUpperCase());
        item.setAvailableQuantity(request.initialQuantity());
        item.setReservedQuantity(0);
        item.setReorderLevel(request.reorderLevel());

        // ===================================================================
        // ASIGNACIÓN DE VALORES POR DEFECTO PARA LOS NUEVOS CAMPOS DE ROTACIÓN
        // (Mantiene compatibilidad con el CreateInventoryItemRequest original)
        // ===================================================================
        item.setBasePrice(100.0);           // Precio base inicial predeterminado
        item.setDaysInWarehouse(0);         // Todo producto nuevo ingresa con 0 días
        item.setCriticalRotationDays(30);   // Umbral de 30 días para aplicar descuento

        return toResponse(repository.save(item));
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> findAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryItemResponse findBySku(String sku) {
        InventoryItem item = loadBySku(sku);
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public InventoryAvailabilityResponse checkAvailability(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        boolean available = item.getAvailableQuantity() >= quantity;
        return new InventoryAvailabilityResponse(
                item.getSku(),
                quantity,
                item.getAvailableQuantity(),
                available
        );
    }

    public static final String MSG_CANTIDAD_MAYOR_CERO = "La cantidad debe ser mayor a 0.";

    public InventoryItemResponse reserve(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        if (quantity <= 0) {
            throw new InventoryOperationException(MSG_CANTIDAD_MAYOR_CERO);
        }
        if (item.getAvailableQuantity() < quantity) {
            throw new InventoryOperationException(
                    "Stock insuficiente para SKU " + sku + ". Disponible: " + item.getAvailableQuantity());
        }

        item.setAvailableQuantity(item.getAvailableQuantity() - quantity);
        item.setReservedQuantity(item.getReservedQuantity() + quantity);

        return toResponse(repository.save(item));
    }

    public InventoryItemResponse release(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        if (quantity <= 0) {
            throw new InventoryOperationException(MSG_CANTIDAD_MAYOR_CERO);
        }
        if (item.getReservedQuantity() < quantity) {
            throw new InventoryOperationException(
                    "No hay suficiente stock reservado para liberar en SKU " + sku);
        }

        item.setReservedQuantity(item.getReservedQuantity() - quantity);
        item.setAvailableQuantity(item.getAvailableQuantity() + quantity);

        return toResponse(repository.save(item));
    }

    public InventoryItemResponse dispatch(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        if (quantity <= 0) {
            throw new InventoryOperationException(MSG_CANTIDAD_MAYOR_CERO);
        }
        if (item.getReservedQuantity() < quantity) {
            throw new InventoryOperationException(
                    "No hay stock reservado suficiente para despachar SKU " + sku);
        }

        item.setReservedQuantity(item.getReservedQuantity() - quantity);
        return toResponse(repository.save(item));
    }

    // ==========================================
    //       MÉTODOS AGREGADOS PARA EL CRUD
    // ==========================================

    public InventoryItemResponse updateItem(String sku, UpdateInventoryItemRequest request) {
        InventoryItem item = loadBySku(sku);

        item.setProductName(request.productName().trim());
        item.setAvailableQuantity(request.availableQuantity());
        item.setReservedQuantity(request.reservedQuantity());
        item.setReorderLevel(request.reorderLevel());

        return toResponse(repository.save(item));
    }

    public void deleteItem(String sku) {
        InventoryItem item = loadBySku(sku);
        repository.delete(item);
    }

    // ==========================================
    //       MÉTODOS DE ESTRATEGIA (NUEVO AVANCE)
    // ==========================================

    @Transactional(readOnly = true)
    public InventoryPriceResponse getDynamicCalculatedPrice(String sku) {
        InventoryItem item = loadBySku(sku);

        PriceStrategy strategy;
        boolean hasDiscount = false;

        // Evaluamos el estancamiento usando los campos del item
        if (item.getDaysInWarehouse() >= item.getCriticalRotationDays()) {
            strategy = new LowRotationDiscountStrategy(15.0); // 15% de descuento por baja rotación
            hasDiscount = true;
        } else {
            strategy = new NormalPriceStrategy();
        }

        double finalPrice = strategy.calculatePrice(item.getBasePrice());

        return new InventoryPriceResponse(
                item.getSku(),
                item.getProductName(),
                item.getAvailableQuantity(),
                item.getBasePrice(),
                finalPrice,
                hasDiscount
        );
    }

    // ==========================================
    //       MÉTODOS PRIVADOS DE APOYO
    // ==========================================

    private InventoryItem loadBySku(String sku) {
        return repository.findBySku(sku.trim().toUpperCase())
                .orElseThrow(() -> new InventoryNotFoundException("No existe inventario para SKU: " + sku));
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        return new InventoryItemResponse(
                item.getSku(),
                item.getProductName(),
                item.getWarehouseCode(),
                item.getAvailableQuantity(),
                item.getReservedQuantity(),
                item.getReorderLevel(),
                item.getUpdatedAt()
        );
    }
}