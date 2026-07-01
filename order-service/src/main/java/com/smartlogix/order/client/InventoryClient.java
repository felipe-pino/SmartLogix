package com.smartlogix.order.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Component
public class InventoryClient {

    private final RestTemplate activeTemplate;
    private final String baseUrl;

    public InventoryClient(RestTemplate restTemplate, @Qualifier("directRestTemplate") RestTemplate directRestTemplate) {
        String env = System.getenv("INVENTORY_SERVICE_URL");
        if (env != null && !env.isBlank()) {
            this.baseUrl = env;
            this.activeTemplate = directRestTemplate; // local: sin Eureka
        } else {
            this.baseUrl = "http://inventory-service";
            this.activeTemplate = restTemplate; // docker: vía Eureka
        }
    }

    public InventoryAvailabilityResponse checkAvailability(String sku, int quantity) {
        try {
            return activeTemplate.getForObject(
                    baseUrl + "/api/inventory/items/{sku}/availability?quantity={quantity}",
                    InventoryAvailabilityResponse.class,
                    sku,
                    quantity
            );
        } catch (HttpStatusCodeException ex) {
            System.err.println("ERROR EN CHECK_AVAILABILITY (HTTP " + ex.getStatusCode() + "): " + ex.getResponseBodyAsString());
            throw new InventoryClientException("Error consultando disponibilidad: " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            System.err.println("ERROR DE RED EN CHECK_AVAILABILITY:");
            ex.printStackTrace();
            throw new InventoryClientException("Problema de conexión con inventario al chequear stock: " + ex.getMessage(), ex);
        }
    }

    public void reserve(String sku, int quantity) {
        try {
            activeTemplate.postForObject(
                    baseUrl + "/api/inventory/items/{sku}/reserve?quantity={quantity}",
                    null,
                    Object.class,
                    sku,
                    quantity
            );
        } catch (HttpStatusCodeException ex) {
            String errorReal = ex.getResponseBodyAsString();
            throw new InventoryClientException("El inventario rechazó la reserva de " + sku + ". ERROR REAL DEL SERVICIO: " + errorReal, ex);
        } catch (RestClientException ex) {
            throw new InventoryClientException("Problema de conexión con el inventario para " + sku + ": " + ex.getMessage(), ex);
        }
    }

    public void release(String sku, int quantity) {
        try {
            activeTemplate.postForObject(
                    baseUrl + "/api/inventory/items/{sku}/release?quantity={quantity}",
                    null,
                    Object.class,
                    sku,
                    quantity
            );
        } catch (HttpStatusCodeException ex) {
            throw new InventoryClientException("El inventario rechazó liberar " + sku + ". ERROR REAL: " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            throw new InventoryClientException("Problema de conexión con el inventario para " + sku + ": " + ex.getMessage(), ex);
        }
    }

    public InventoryItemResponse getItemBySku(String sku) {
        try {
            return activeTemplate.getForObject(
                    baseUrl + "/api/inventory/items/{sku}",
                    InventoryItemResponse.class,
                    sku
            );
        } catch (HttpStatusCodeException ex) {
            throw new InventoryClientException("Error al obtener detalles del ítem " + sku + ": " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            throw new InventoryClientException("Problema de conexión al obtener detalles del ítem " + sku + ": " + ex.getMessage(), ex);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class InventoryItemResponse {
        private String sku;

        @JsonProperty("availableQuantity")
        private Integer availableQuantity;

        @JsonProperty("reorderLevel")
        private Integer reorderLevel;

        @JsonProperty("updatedAt")
        private java.time.LocalDateTime updatedAt;

        public InventoryItemResponse() {}

        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }

        public Integer getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }

        public Integer getReorderLevel() { return reorderLevel; }
        public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

        public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}