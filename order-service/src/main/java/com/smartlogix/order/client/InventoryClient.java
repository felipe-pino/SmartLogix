package com.smartlogix.order.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class InventoryClient {

    private final RestTemplate restTemplate;

    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public InventoryAvailabilityResponse checkAvailability(String sku, int quantity) {
        try {
            return restTemplate.getForObject(
                    "http://inventory-service/api/inventory/items/{sku}/availability?quantity={quantity}",
                    InventoryAvailabilityResponse.class,
                    sku,
                    quantity
            );
        } catch (HttpStatusCodeException ex) {
            System.err.println("ERROR EN CHECK_AVAILABILITY (HTTP " + ex.getStatusCode() + "): " + ex.getResponseBodyAsString());
            throw new InventoryClientException("Error consultando disponibilidad: " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            System.err.println("ERROR DE RED/BALANCEO EN CHECK_AVAILABILITY:");
            ex.printStackTrace(); // <--- ESTO VA A OBLIGAR A SPRING A PINTAR TODA LA TRAZA EN CONSOLA
            throw new InventoryClientException("Problema de conexión con inventario al chequear stock: " + ex.getMessage(), ex);
        }
    }

    public void reserve(String sku, int quantity) {
        try {
            restTemplate.postForObject(
                    "http://inventory-service/api/inventory/items/{sku}/reserve?quantity={quantity}",
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
            restTemplate.postForObject(
                    "http://inventory-service/api/inventory/items/{sku}/release?quantity={quantity}",
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
}