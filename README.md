# SmartLogix - Plataforma Inteligente para Gestión Logística de eCommerce

Plataforma de microservicios para PYMEs de eCommerce que resuelve los problemas de sistemas monolíticos: inconsistencias en la información, retrasos en la entrega y dificultades para manejar picos de demanda.

## Módulos del sistema

- Autenticación y usuarios (`auth-service`)
- Gestión de Inventario (`inventory-service`)
- Procesamiento de Pedidos (`order-service`)
- Coordinación de Envíos (`shipment-service`)
- Descubrimiento de servicios (`discovery-service` con Eureka)
- API Gateway / BFF (`api-gateway`)
- Frontend React + Vite (`frontend`)

## Patrones de diseño implementados

- `Repository Pattern`: acceso a datos desacoplado con Spring Data JPA en todos los microservicios.
- `DTO Pattern`: Java Records para transferencia de datos entre capas (Request/Response separados).
- `Strategy Pattern`: en `auth-service` para autenticación por username o email intercambiable.
- `Factory Method`: en `shipment-service` para crear planes de envío por zona geográfica (Norte/Sur/Centro).
- `Chain of Responsibility`: `GlobalExceptionHandler` con `@RestControllerAdvice` en todos los microservicios.
- `Filter Pattern`: `JwtAuthenticationFilter` con `OncePerRequestFilter` en todos los microservicios.
- `Circuit Breaker`: en `order-service` y `api-gateway` con Resilience4j para tolerancia a fallos.
- `Context Pattern`: `AuthContext` en el frontend para estado global de autenticación.
- `Service Layer`: separación de capas API/Service en el frontend.

## Patrones arquitectónicos implementados

- `Service Discovery`: registro dinámico con Eureka.
- `API Gateway / BFF`: punto único de entrada con enrutamiento, CORS y Circuit Breaker perimetral.
- `Database per Service`: cada microservicio usa su propia base de datos PostgreSQL.
- `Microservicios`: despliegue independiente por dominio de negocio.

## Estrategia de Branching

El proyecto usa **Feature Branch Workflow**:

- `main`: rama estable de producción. Solo recibe cambios por Pull Request.
- `CRUD`: rama de desarrollo del Parcial 2. Implementa operaciones CRUD completas en todos los microservicios.

**Pull Request #1** abierto: `CRUD → main` con la implementación completa de endpoints PUT/PATCH/DELETE en todos los servicios y la ServicesPage del frontend.

## Estructura del repositorio

```
smartlogix/
├── discovery-service/     (puerto 8761)
├── api-gateway/           (puerto 8080)
├── auth-service/          (puerto 8084)
├── inventory-service/     (puerto 8081)
├── order-service/         (puerto 8085)
├── shipment-service/      (puerto 8083)
├── frontend/              (puerto 80 via Nginx)
├── docker-compose.yml
├── init.sql
└── pom.xml                (POM padre multi-módulo)
```

## Requisitos

- Java 17
- Maven Wrapper (`mvnw.cmd` incluido)
- Docker Desktop

## Compilar y ejecutar tests

```powershell
.\mvnw.cmd clean test
```

## Docker (recomendado)

```powershell
docker compose up --build -d
docker compose ps
```

Para detener:

```powershell
docker compose down
```

También puedes usar el script:

```powershell
.\run-docker.ps1
```

## Ejecutar manualmente (sin Docker)

Iniciar en este orden, cada comando en una terminal distinta:

```powershell
.\mvnw.cmd -pl discovery-service spring-boot:run
.\mvnw.cmd -pl auth-service spring-boot:run
.\mvnw.cmd -pl inventory-service spring-boot:run
.\mvnw.cmd -pl shipment-service spring-boot:run
.\mvnw.cmd -pl order-service spring-boot:run
.\mvnw.cmd -pl api-gateway spring-boot:run
```

También puedes usar el script:

```powershell
.\run-services.ps1
```

## URLs principales

- Frontend: `http://localhost`
- API Gateway: `http://localhost:8080`
- Eureka Dashboard: `http://localhost:8761`

## Credenciales de prueba

| Usuario    | Contraseña  | Rol                    |
|------------|-------------|------------------------|
| admin      | admin123    | ROLE_ADMIN             |
| usuario    | user123     | ROLE_USER              |
| bodeguero  | bodega123   | ROLE_WAREHOUSE_MANAGER |

## Endpoints clave

### Auth Service (`/api/auth`)
- `POST /api/auth/login` — autenticación por username o email
- `POST /api/auth/register` — registro de nuevo usuario
- `GET /api/auth/users` — listar usuarios (requiere token)
- `PUT /api/auth/users/{id}` — actualizar usuario
- `DELETE /api/auth/users/{id}` — eliminar usuario

### Inventory Service (`/api/inventory`)
- `GET /api/inventory/items` — listar inventario
- `POST /api/inventory/items` — crear producto
- `PUT /api/inventory/items/{sku}` — actualizar producto
- `DELETE /api/inventory/items/{sku}` — eliminar producto
- `GET /api/inventory/items/{sku}/availability?quantity=N` — verificar disponibilidad

### Order Service (`/api/orders`)
- `POST /api/orders` — crear orden (valida stock y solicita envío)
- `GET /api/orders` — listar órdenes
- `GET /api/orders/{orderNumber}` — buscar orden
- `PATCH /api/orders/{orderNumber}` — actualizar estado
- `DELETE /api/orders/{orderNumber}` — eliminar orden

### Shipment Service (`/api/shipments`)
- `POST /api/shipments` — crear envío
- `GET /api/shipments` — listar envíos
- `GET /api/shipments/{trackingCode}` — buscar envío
- `PATCH /api/shipments/{trackingCode}` — actualizar envío completo
- `PATCH /api/shipments/{trackingCode}/status?value=IN_TRANSIT` — actualizar estado
- `DELETE /api/shipments/{trackingCode}` — eliminar envío

## Flujo funcional

1. El frontend autentica al usuario contra `auth-service` y obtiene un JWT.
2. El JWT se envía en cada petición al `api-gateway` (puerto 8080).
3. El gateway valida el token, aplica Circuit Breaker y enruta al microservicio correspondiente.
4. Para crear una orden: `order-service` consulta disponibilidad en `inventory-service`, reserva el stock, solicita el envío a `shipment-service` y retorna la orden con `trackingCode`.
5. Si `shipment-service` no responde, el Circuit Breaker activa el fallback y la orden queda con estado `FAILED`.

## Pruebas unitarias

```powershell
# Backend (JUnit 5 + MockMvc)
.\mvnw.cmd -pl order-service test

# Frontend (Vitest)
cd frontend/fron_smart_logix
npm run test
npm run coverage
```

**Cobertura de tests:**
- `OrderControllerTest.java`: GET /api/orders (200), GET orden inexistente (404), POST sin body (400)
- `formatters.test.js`: formatCurrency, formatDate, normalizeSearchTerm — 7 casos
- `httpClient.test.js`: inyección de token, interceptor 401, 204 No Content, error 500 — 4 casos
