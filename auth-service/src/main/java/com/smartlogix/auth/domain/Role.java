package com.smartlogix.auth.domain;

public enum Role {
    ROLE_USER,
    ROLE_ADMIN,
    ROLE_WAREHOUSE_MANAGER,
    ROLE_ORDER_MANAGER,      // <-- El encargado de gestionar órdenes
    ROLE_SHIPMENT_MANAGER,   // <-- El encargado de despachos/envíos
    ROLE_INVENTORY_MANAGER   // <-- El encargado de controlar el stock
}