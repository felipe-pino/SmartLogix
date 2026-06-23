package com.smartlogix.payment.config;

import feign.RequestInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    private static final Logger log = LoggerFactory.getLogger(FeignConfig.class);

    @Bean
    public RequestInterceptor requestTokenBearerInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader("Authorization");
                if (authHeader != null) {
                    requestTemplate.header("Authorization", authHeader);
                }
            } else {
                // CORREGIDO: log explícito si se llama Feign fuera del contexto HTTP
                // (ej: jobs, eventos asíncronos). Sin este log, el bug es invisible.
                log.warn(
                        "FeignConfig: No hay contexto de request activo (posible llamada asíncrona). " +
                                "El header Authorization no será propagado al endpoint: {}",
                        requestTemplate.url()
                );
            }
        };
    }
}