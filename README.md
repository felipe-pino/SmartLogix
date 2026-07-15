# SmartLogix

Sistema de gestión logística basado en **arquitectura de microservicios**: inventario, órdenes de compra, pagos y envíos, con un frontend en React y un API Gateway como punto único de entrada.

Este repositorio contiene la documentación general del proyecto y el `docker-compose.yml` que orquesta todo el sistema. El código de cada componente vive en su propio repositorio (ver `repositorios.txt`).

## Arquitectura

- **Frontend**: React + Vite (SPA)
- **API Gateway**: Spring Cloud Gateway (BFF, punto único de entrada, valida JWT)
- **Discovery Service**: Eureka Server (registro y descubrimiento de servicios)
- **Microservicios**: Auth, Inventory, Order, Payment, Shipment (Spring Boot)
- **Persistencia**: PostgreSQL 15, una base de datos por microservicio (patrón Database per Service)

Ver `Diagrama_Arquitectura_SmartLogix.png` para el detalle completo.

## Requisitos

- Docker y Docker Compose
- Archivo `.env` en la raíz con las variables `DB_USERNAME`, `DB_PASSWORD` y `JWT_SECRET`

## Levantar todo el sistema

```bash
docker compose up -d
```

Esto levanta, en orden: PostgreSQL, Discovery Service, los 5 microservicios, el API Gateway y el Frontend.

Verifica que todo esté corriendo:

```bash
docker compose ps
```

## Acceso a los servicios

| Servicio | URL |
|---|---|
| Frontend | http://localhost:80 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| PostgreSQL | localhost:5432 |

## Detener el sistema

```bash
docker compose down
```

## Documentación adicional

- `Descripcion_Persistencia_SmartLogix.pdf` — cómo se implementa la persistencia de datos en cada microservicio.
- `ejemplos_api_rest.md` — ejemplos de peticiones y respuestas de la API REST, incluyendo comunicación interna entre servicios.
- `repositorios.txt` — enlaces a los repositorios de cada componente del sistema.

## Repositorios del proyecto

Ver `repositorios.txt` para el detalle completo de cada repositorio y su propósito.
