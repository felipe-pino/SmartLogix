package com.smartlogix.inventory.service;

import com.smartlogix.inventory.domain.InventoryItem;
import com.smartlogix.inventory.dto.CreateInventoryItemRequest;
import com.smartlogix.inventory.dto.UpdateInventoryItemRequest;
import com.smartlogix.inventory.dto.InventoryAvailabilityResponse;
import com.smartlogix.inventory.dto.InventoryItemResponse;
import com.smartlogix.inventory.exception.InventoryNotFoundException;
import com.smartlogix.inventory.exception.InventoryOperationException;
import com.smartlogix.inventory.repository.InventoryItemRepository;
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
        item.setPrice(request.price()); // AGREGADO

        return toResponse(repository.save(item));
    }

    public List<InventoryItemResponse> getAllInventory() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public InventoryItemResponse findBySku(String sku) {
        return toResponse(loadBySku(sku));
    }

    public InventoryAvailabilityResponse checkAvailability(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        boolean available = item.getAvailableQuantity() >= quantity;
        return new InventoryAvailabilityResponse(item.getSku(), quantity, item.getAvailableQuantity(), available);
    }

    public InventoryItemResponse reserveStock(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        if (item.getAvailableQuantity() < quantity) {
            throw new InventoryOperationException("Stock insuficiente para reservar SKU: " + sku);
        }
        item.setAvailableQuantity(item.getAvailableQuantity() - quantity);
        item.setReservedQuantity(item.getReservedQuantity() + quantity);
        return toResponse(repository.save(item));
    }

    public InventoryItemResponse releaseStock(String sku, int quantity) {
        InventoryItem item = loadBySku(sku);
        if (item.getReservedQuantity() < quantity) {
            throw new InventoryOperationException("No hay suficiente stock reservado para liberar en SKU: " + sku);
        }
        item.setAvailableQuantity(item.getAvailableQuantity() + quantity);
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
        item.setPrice(request.price()); // AGREGADO

        return toResponse(repository.save(item));
    }

    public void deleteItem(String sku) {
        InventoryItem item = loadBySku(sku);
        repository.delete(item);
    }

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
                item.getPrice(), // AGREGADO
                item.getUpdatedAt()
        );
    }
}