package com.smartlogix.order.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ShipmentClient {

    private final RestTemplate activeTemplate;
    private final CircuitBreakerFactory<?, ?> circuitBreakerFactory;
    private final String baseUrl;

    public ShipmentClient(
            RestTemplate restTemplate,
            @Qualifier("directRestTemplate") RestTemplate directRestTemplate,
            CircuitBreakerFactory<?, ?> circuitBreakerFactory
    ) {
        this.circuitBreakerFactory = circuitBreakerFactory;
        String env = System.getenv("SHIPMENT_SERVICE_URL");
        if (env != null && !env.isBlank()) {
            this.baseUrl = env;
            this.activeTemplate = directRestTemplate; // local: sin Eureka
        } else {
            this.baseUrl = "http://shipment-service";
            this.activeTemplate = restTemplate; // docker: vía Eureka
        }
    }

    public ShipmentResponse requestShipment(ShipmentRequest request) {
        return circuitBreakerFactory.create("shipmentService").run(
                () -> activeTemplate.postForObject(
                        baseUrl + "/api/shipments",
                        request,
                        ShipmentResponse.class
                ),
                throwable -> {
                    System.err.println("ERROR CRÍTICO LLAMANDO A SHIPMENT-SERVICE: " + throwable.getMessage());
                    throwable.printStackTrace();
                    return fallbackResponse(request);
                }
        );
    }

    private ShipmentResponse fallbackResponse(ShipmentRequest request) {
        return new ShipmentResponse(
                null,
                request.orderNumber(),
                "NO_CARRIER",
                "NO_ROUTE",
                null,
                "PENDING_MANUAL_ASSIGNMENT"
        );
    }
}