package com.smartlogix.order;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // TEST 1: Validar obtener todas las órdenes
    @Test
    public void testGetAllOrders() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // TEST 2: Validar buscar una orden que no existe (Debe dar 404)
    @Test
    public void testGetOrderNotFound() throws Exception {
        mockMvc.perform(get("/api/orders/999999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // TEST 3: Validar protección de ruta (Crear orden sin datos da error 400)
    @Test
    public void testCreateOrderBadRequest() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}