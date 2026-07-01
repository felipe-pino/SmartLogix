package com.smartlogix.order.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class HttpClientConfig {

    // Interceptor compartido: propaga el token JWT en las llamadas internas
    private ClientHttpRequestInterceptor authInterceptor() {
        return (request, body, execution) -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                HttpServletRequest nativeRequest = attributes.getRequest();
                String authHeader = nativeRequest.getHeader(HttpHeaders.AUTHORIZATION);

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    request.getHeaders().add(HttpHeaders.AUTHORIZATION, authHeader);
                }
            }
            return execution.execute(request, body);
        };
    }

    // Usado en Docker: resuelve nombres lógicos ("inventory-service") vía Eureka
    @Bean
    @LoadBalanced
    RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add(authInterceptor());
        return restTemplate;
    }

    // Usado en local: pega directo a host:puerto reales, sin pasar por Eureka
    @Bean
    RestTemplate directRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add(authInterceptor());
        return restTemplate;
    }
}