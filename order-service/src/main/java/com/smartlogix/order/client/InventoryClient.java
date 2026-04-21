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
        return restTemplate.getForObject(
                "http://inventory-service/api/inventory/items/{sku}/availability?quantity={quantity}",
                InventoryAvailabilityResponse.class,
                sku,
                quantity
        );
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
            // AQUI LE QUITAMOS LA MORDAZA: Esto va a capturar el error REAL que el inventario está lanzando
            String errorReal = ex.getResponseBodyAsString();
            throw new InventoryClientException("El inventario rechazó la reserva de " + sku + ". ERROR REAL DEL SERVICIO: " + errorReal, ex);
        } catch (RestClientException ex) {
            // Este catch se activará solo si el inventario está apagado o hay un problema de red en Docker
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