package com.smartlogix.auth.dto;

public record UserDTO(
        Long id,
        String username,
        String email,
        String role,
        boolean enabled
) {}