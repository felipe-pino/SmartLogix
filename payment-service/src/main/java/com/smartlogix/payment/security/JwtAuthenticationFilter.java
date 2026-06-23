package com.smartlogix.payment.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // JWT tiene formato: header.payload.signature
                String[] parts = token.split("\\.");
                if (parts.length != 3) {
                    log.warn("Token JWT con formato inválido recibido en payment-service");
                    filterChain.doFilter(request, response);
                    return;
                }

                // Decodificar payload en Base64 — sin dependencia jjwt
                byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
                Map<?, ?> claims = objectMapper.readValue(payloadBytes, Map.class);

                String username = (String) claims.get("sub");

                // El auth-service guarda el rol como String singular en el claim "role"
                // Ej: "ROLE_ADMIN", "ROLE_USER", "ROLE_WAREHOUSE_MANAGER", etc.
                String role = (String) claims.get("role");

                List<SimpleGrantedAuthority> authorities = (role != null)
                        ? List.of(new SimpleGrantedAuthority(role))
                        : List.of();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                log.warn("No se pudo procesar el token JWT en payment-service: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}