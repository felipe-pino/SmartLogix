import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createInventoryItemRequest,
  updateInventoryItemRequest,
  deleteInventoryItemRequest
} from "../api/inventoryApi";
import { 
  createOrderRequest, 
  updateOrderStatusRequest, 
  deleteOrderRequest 
} from "../api/orderApi";
import { getAllUsersRequest, updateUserRequest } from "../api/authApi";
import { 
  createShipmentRequest, 
  updateShipmentRequest, 
  updateShipmentStatusRequest, 
  deleteShipmentRequest 
} from "../api/shipmentApi";
import "../App.css";

// ==========================================
// ESTADO INICIAL DE LOS FORMULARIOS
// ==========================================
const INITIAL_INVENTORY = {
  sku: "", productName: "", warehouseCode: "", initialQuantity: 0, reorderLevel: 0,
};

const INITIAL_INVENTORY_UPDATE = { 
  sku: "", productName: "", availableQuantity: 0, reservedQuantity: 0, reorderLevel: 0 
};

const INITIAL_INVENTORY_DELETE = { sku: "" };

const INITIAL_ORDER = {
  customerName: "", customerEmail: "", shippingAddress: "", lines: [{ sku: "", quantity: 1, unitPrice: 0.01 }],
};

const INITIAL_ORDER_STATUS_UPDATE = { orderNumber: "", status: "PENDING", trackingCode: "", reason: "" };
const INITIAL_ORDER_DELETE = { orderNumber: "" };

const INITIAL_SHIPMENT_CREATE = { orderNumber: "", destinationAddress: "", totalUnits: 1 };
const INITIAL_SHIPMENT_UPDATE = { trackingCode: "", status: "PLANNED", carrier: "", routeCode: "", estimatedDeliveryDate: "" };
const INITIAL_SHIPMENT_STATUS = { trackingCode: "", status: "PLANNED" };
const INITIAL_SHIPMENT_DELETE = { trackingCode: "" };

// ==========================================
// LISTAS ESTÁTICAS
// ==========================================
const ROLES_LIST = [
  "ROLE_USER", "ROLE_ADMIN", "ROLE_WAREHOUSE_MANAGER", 
  "ROLE_ORDER_MANAGER", "ROLE_SHIPMENT_MANAGER", "ROLE_INVENTORY_MANAGER"
];

const ORDER_STATUS_LIST = ["PENDING", "APPROVED", "REJECTED", "SHIPMENT_REQUESTED", "FAILED"];
const SHIPMENT_STATUS_LIST = ["PLANNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

// ==========================================
// HELPERS DE FORMATEO
// ==========================================
const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

const safeFloat = (value, fallback = 0.01) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

const normalizeEmail = (email) => {
  const trimmed = email.trim();
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) return `${trimmed}@cliente.com`;
  if (atCount > 1) {
    const [local, ...rest] = trimmed.split("@");
    return `${local}@${rest.join("")}`;
  }
  return trimmed;
};

// ==========================================
// COMPONENTE DE ALERTAS
// ==========================================
function FormAlert({ status }) {
  if (!status) return null;
  return <div className={`services-form-alert ${status.type}`}>{status.message}</div>;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function ServicesPage() {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || "ROLE_USER";

  const [inventoryForm, setInventoryForm] = useState(INITIAL_INVENTORY);
  const [inventoryUpdateForm, setInventoryUpdateForm] = useState(INITIAL_INVENTORY_UPDATE);
  const [inventoryDeleteForm, setInventoryDeleteForm] = useState(INITIAL_INVENTORY_DELETE);

  const [orderForm, setOrderForm] = useState(INITIAL_ORDER);
  const [orderStatusUpdateForm, setOrderStatusUpdateForm] = useState(INITIAL_ORDER_STATUS_UPDATE);
  const [orderDeleteForm, setOrderDeleteForm] = useState(INITIAL_ORDER_DELETE);

  const [shipmentCreateForm, setShipmentCreateForm] = useState(INITIAL_SHIPMENT_CREATE);
  const [shipmentUpdateForm, setShipmentUpdateForm] = useState(INITIAL_SHIPMENT_UPDATE);
  const [shipmentStatusForm, setShipmentStatusForm] = useState(INITIAL_SHIPMENT_STATUS);
  const [shipmentDeleteForm, setShipmentDeleteForm] = useState(INITIAL_SHIPMENT_DELETE);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersStatus, setUsersStatus] = useState(null);

  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [inventoryUpdateStatus, setInventoryUpdateStatus] = useState(null);
  const [inventoryDeleteStatus, setInventoryDeleteStatus] = useState(null);

  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryUpdateLoading, setInventoryUpdateLoading] = useState(false);
  const [inventoryDeleteLoading, setInventoryDeleteLoading] = useState(false);

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const [orderStatusUpdateStatus, setOrderStatusUpdateStatus] = useState(null);
  const [orderStatusUpdateLoading, setOrderStatusUpdateLoading] = useState(false);

  const [orderDeleteStatus, setOrderDeleteStatus] = useState(null);
  const [orderDeleteLoading, setOrderDeleteLoading] = useState(false);

  const [shipmentCreateStatus, setShipmentCreateStatus] = useState(null);
  const [shipmentCreateLoading, setShipmentCreateLoading] = useState(false);

  const [shipmentUpdateStatus, setShipmentUpdateStatus] = useState(null);
  const [shipmentUpdateLoading, setShipmentUpdateLoading] = useState(false);

  const [shipmentStatusUpdateStatus, setShipmentStatusUpdateStatus] = useState(null);
  const [shipmentStatusUpdateLoading, setShipmentStatusUpdateLoading] = useState(false);

  const [shipmentDeleteStatus, setShipmentDeleteStatus] = useState(null);
  const [shipmentDeleteLoading, setShipmentDeleteLoading] = useState(false);

  useEffect(() => {
    const loadAdminData = async () => {
      setUsersLoading(true);
      try {
        const usersData = await getAllUsersRequest();
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error al cargar usuarios:", error); 
        setUsersStatus({
          type: "error",
          message: "Error al sincronizar los usuarios con el Backend.",
        });
      } finally {
        setUsersLoading(false);
      }
    };

    if (role === "ROLE_ADMIN") {
      loadAdminData();
    }
  }, [role]);

  // =========================================================
  // SUBMITS INVENTARIO
  // =========================================================
  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    setInventoryStatus(null);
    setInventoryLoading(true);

    const payload = {
      sku: inventoryForm.sku.trim().toUpperCase(),
      productName: inventoryForm.productName.trim(),
      warehouseCode: inventoryForm.warehouseCode.trim().toUpperCase(),
      initialQuantity: safeNumber(inventoryForm.initialQuantity),
      reorderLevel: safeNumber(inventoryForm.reorderLevel),
    };

    try {
      await createInventoryItemRequest(payload);
      setInventoryStatus({ type: "success", message: `Producto "${payload.productName}" registrado.` });
      setInventoryForm(INITIAL_INVENTORY);
    } catch (error) {
      setInventoryStatus({ type: "error", message: error.message || "Error al registrar producto." });
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleInventoryUpdateSubmit = async (e) => {
    e.preventDefault();
    setInventoryUpdateStatus(null);
    
    const sku = inventoryUpdateForm.sku.trim().toUpperCase();
    if (!sku) return setInventoryUpdateStatus({ type: "error", message: "SKU es obligatorio." });

    setInventoryUpdateLoading(true);

    const payload = {
      productName: inventoryUpdateForm.productName.trim(),
      availableQuantity: safeNumber(inventoryUpdateForm.availableQuantity),
      reservedQuantity: safeNumber(inventoryUpdateForm.reservedQuantity),
      reorderLevel: safeNumber(inventoryUpdateForm.reorderLevel),
    };

    try {
      await updateInventoryItemRequest(sku, payload);
      setInventoryUpdateStatus({ type: "success", message: `Producto ${sku} actualizado correctamente.` });
      setInventoryUpdateForm(INITIAL_INVENTORY_UPDATE);
    } catch (error) {
      setInventoryUpdateStatus({ type: "error", message: error.message || "Error al actualizar producto." });
    } finally {
      setInventoryUpdateLoading(false);
    }
  };

  const handleInventoryDeleteSubmit = async (e) => {
    e.preventDefault();
    setInventoryDeleteStatus(null);

    const sku = inventoryDeleteForm.sku.trim().toUpperCase();
    if (!sku) return setInventoryDeleteStatus({ type: "error", message: "SKU es obligatorio." });

    if (!window.confirm(`¿Seguro que deseas eliminar definitivamente el producto ${sku}?`)) return;

    setInventoryDeleteLoading(true);
    try {
      await deleteInventoryItemRequest(sku);
      setInventoryDeleteStatus({ type: "success", message: `Producto ${sku} eliminado del sistema.` });
      setInventoryDeleteForm(INITIAL_INVENTORY_DELETE);
    } catch (error) {
      setInventoryDeleteStatus({ type: "error", message: error.message || "Error al eliminar producto." });
    } finally {
      setInventoryDeleteLoading(false);
    }
  };

  // =========================================================
  // SUBMITS ÓRDENES
  // =========================================================
  const handleAddOrderLine = () => setOrderForm((prev) => ({ ...prev, lines: [...prev.lines, { sku: "", quantity: 1, unitPrice: 0.01 }] }));
  const handleOrderLineChange = (index, field, value) => setOrderForm((prev) => ({ ...prev, lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line) }));
  const handleRemoveOrderLine = (index) => setOrderForm((prev) => ({ ...prev, lines: prev.lines.length <= 1 ? prev.lines : prev.lines.filter((_, i) => i !== index) }));
  const insertAtSymbol = () => setOrderForm((prev) => prev.customerEmail.includes("@") ? prev : { ...prev, customerEmail: prev.customerEmail + "@" });

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus(null);
    setOrderLoading(true);

    const payload = {
      customerName: orderForm.customerName.trim(),
      customerEmail: normalizeEmail(orderForm.customerEmail),
      shippingAddress: orderForm.shippingAddress.trim(),
      lines: orderForm.lines.map((line) => ({
        sku: line.sku.trim().toUpperCase(),
        quantity: safeNumber(line.quantity, 1),
        unitPrice: safeFloat(line.unitPrice, 0.01),
      })),
    };

    try {
      await createOrderRequest(payload);
      setOrderStatus({ type: "success", message: `Orden creada para "${payload.customerName}".` });
      setOrderForm(INITIAL_ORDER);
    } catch (error) {
      let friendlyMessage = "";

      // Extracción exhaustiva del mensaje real enviado por el Backend
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          friendlyMessage = error.response.data;
        } else if (error.response.data.message) {
          friendlyMessage = error.response.data.message;
        } else if (error.response.data.error) {
          friendlyMessage = error.response.data.error;
        }
      }

      // Si no logramos extraer un mensaje específico del backend, evaluamos el error base
      if (!friendlyMessage || friendlyMessage.includes("500")) {
        friendlyMessage = error.message && !error.message.includes("500") 
          ? error.message 
          : "Stock insuficiente o error interno en el procesamiento de la orden.";
      }

      setOrderStatus({ 
        type: "error", 
        message: `⚠️ Reintento Fallido: ${friendlyMessage}` 
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOrderStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    setOrderStatusUpdateStatus(null);
    const orderNum = orderStatusUpdateForm.orderNumber.trim();
    if (!orderNum) return setOrderStatusUpdateStatus({ type: "error", message: "Número de Orden obligatorio." });

    setOrderStatusUpdateLoading(true);
    const trackingValue = orderStatusUpdateForm.trackingCode.trim();
    const reasonValue = orderStatusUpdateForm.reason.trim();

    try {
      await updateOrderStatusRequest(orderNum, {
        status: orderStatusUpdateForm.status,
        trackingCode: trackingValue === "" ? null : trackingValue,
        reason: reasonValue === "" ? null : reasonValue,
      });
      setOrderStatusUpdateStatus({ type: "success", message: `Orden ${orderNum} cambiada a ${orderStatusUpdateForm.status}.` });
      setOrderStatusUpdateForm(INITIAL_ORDER_STATUS_UPDATE);
    } catch (error) {
      setOrderStatusUpdateStatus({ type: "error", message: error.message || "Error al actualizar la orden." });
    } finally {
      setOrderStatusUpdateLoading(false);
    }
  };

  const handleOrderDeleteSubmit = async (e) => {
    e.preventDefault();
    setOrderDeleteStatus(null);
    const orderNum = orderDeleteForm.orderNumber.trim();
    if (!orderNum) return setOrderDeleteStatus({ type: "error", message: "Número de Orden obligatorio." });
    if (!window.confirm(`¿Seguro que deseas eliminar definitivamente la orden ${orderNum}?`)) return;

    setOrderDeleteLoading(true);
    try {
      await deleteOrderRequest(orderNum);
      setOrderDeleteStatus({ type: "success", message: `Orden ${orderNum} eliminada del sistema.` });
      setOrderDeleteForm(INITIAL_ORDER_DELETE);
    } catch (error) {
      setOrderDeleteStatus({ type: "error", message: error.message || "Error al eliminar orden." });
    } finally {
      setOrderDeleteLoading(false);
    }
  };

  // =========================================================
  // SUBMITS LOGÍSTICA
  // =========================================================
  const handleShipmentCreateSubmit = async (e) => {
    e.preventDefault();
    setShipmentCreateStatus(null);
    setShipmentCreateLoading(true);

    try {
      await createShipmentRequest({
        orderNumber: shipmentCreateForm.orderNumber.trim(),
        destinationAddress: shipmentCreateForm.destinationAddress.trim(),
        totalUnits: safeNumber(shipmentCreateForm.totalUnits, 1),
      });
      setShipmentCreateStatus({ type: "success", message: `Envío generado para orden "${shipmentCreateForm.orderNumber.trim()}".` });
      setShipmentCreateForm(INITIAL_SHIPMENT_CREATE);
    } catch (error) {
      setShipmentCreateStatus({ type: "error", message: error.message || "Error al generar envío." });
    } finally {
      setShipmentCreateLoading(false);
    }
  };

  const handleShipmentUpdateSubmit = async (e) => {
    e.preventDefault();
    setShipmentUpdateStatus(null);
    const code = shipmentUpdateForm.trackingCode.trim().toUpperCase();
    if (!code) return setShipmentUpdateStatus({ type: "error", message: "Tracking Code obligatorio." });

    setShipmentUpdateLoading(true);
    const carrierValue = shipmentUpdateForm.carrier.trim();
    const routeCodeValue = shipmentUpdateForm.routeCode.trim().toUpperCase();
    const dateValue = shipmentUpdateForm.estimatedDeliveryDate ? shipmentUpdateForm.estimatedDeliveryDate : null;

    try {
      await updateShipmentRequest(code, {
        status: shipmentUpdateForm.status,
        carrier: carrierValue === "" ? null : carrierValue,
        routeCode: routeCodeValue === "" ? null : routeCodeValue,
        estimatedDeliveryDate: dateValue,
      });
      setShipmentUpdateStatus({ type: "success", message: `Envío ${code} actualizado correctamente.` });
      setShipmentUpdateForm(INITIAL_SHIPMENT_UPDATE);
    } catch (error) {
      setShipmentUpdateStatus({ type: "error", message: error.message || "Error al actualizar envío." });
    } finally {
      setShipmentUpdateLoading(false);
    }
  };

  const handleShipmentStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    setShipmentStatusUpdateStatus(null);
    const code = shipmentStatusForm.trackingCode.trim().toUpperCase();
    if (!code) return setShipmentStatusUpdateStatus({ type: "error", message: "Tracking Code obligatorio." });

    setShipmentStatusUpdateLoading(true);
    try {
      await updateShipmentStatusRequest(code, shipmentStatusForm.status);
      setShipmentStatusUpdateStatus({ type: "success", message: `Estado de ${code} cambiado a ${shipmentStatusForm.status}.` });
      setShipmentStatusForm(INITIAL_SHIPMENT_STATUS);
    } catch (error) {
      setShipmentStatusUpdateStatus({ type: "error", message: error.message || "Error al actualizar estado." });
    } finally {
      setShipmentStatusUpdateLoading(false);
    }
  };

  const handleShipmentDeleteSubmit = async (e) => {
    e.preventDefault();
    setShipmentDeleteStatus(null);
    const code = shipmentDeleteForm.trackingCode.trim().toUpperCase();
    if (!code) return setShipmentDeleteStatus({ type: "error", message: "Tracking Code obligatorio." });
    if (!window.confirm(`¿Seguro que deseas eliminar el envío ${code}?`)) return;

    setShipmentDeleteLoading(true);
    try {
      await deleteShipmentRequest(code);
      setShipmentDeleteStatus({ type: "success", message: `Envío ${code} eliminado.` });
      setShipmentDeleteForm(INITIAL_SHIPMENT_DELETE);
    } catch (error) {
      setShipmentDeleteStatus({ type: "error", message: error.message || "Error al eliminar envío." });
    } finally {
      setShipmentDeleteLoading(false);
    }
  };

  const handleRoleChange = async (userId, userCurrentData, newRole) => {
    setUsersStatus(null);
    const previousUsers = [...users];
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      await updateUserRequest(userId, {
        username: userCurrentData.username,
        email: userCurrentData.email,
        role: newRole,
        enabled: userCurrentData.enabled !== undefined ? userCurrentData.enabled : true
      });
      setUsersStatus({ type: "success", message: `Rol actualizado a "${newRole}".` });
    } catch (error) {
      setUsers(previousUsers);
      setUsersStatus({ type: "error", message: error.message || "Error al cambiar rol." });
    }
  };

  if (role === "ROLE_USER") {
    return (
      <div className="container access-denied">
        <h1 className="access-denied-title">Acceso Denegado</h1>
        <p className="access-denied-text">
          Tu perfil actual no tiene permisos para operar los servicios del sistema.
        </p>
        <button className="logout-btn btn-mt-30" onClick={() => navigate("/inventory")}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="inventory-header">
        <div>
          <h1>Panel de Servicios Operativos</h1>
          <p>Herramientas autorizadas para: <strong className="text-highlight-blue">{role}</strong></p>
        </div>
        <button className="nav-btn" onClick={() => navigate("/inventory")}>Volver</button>
      </header>

      <div className="services-layout">

        {/* 1. MÓDULO DE INVENTARIO */}
        {(role === "ROLE_ADMIN" || role === "ROLE_INVENTORY_MANAGER" || role === "ROLE_WAREHOUSE_MANAGER") && (
          <section className="inventory-table-section section-inventory">
            <div className="table-header">
              <h2 className="title-inventory">Módulo de Inventario</h2>
            </div>
            
            <div className="flex-col-gap-35">
              <form onSubmit={handleInventorySubmit} className="flex-col-gap-20">
                <h3 className="subtitle-common title-inventory col-span-all">Crear Nuevo Producto</h3>
                <div className="grid-1-1">
                  <label className="auth-label">SKU <input type="text" className="auth-input" required disabled={inventoryLoading} value={inventoryForm.sku} onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })} /></label>
                  <label className="auth-label">Nombre <input type="text" className="auth-input" required disabled={inventoryLoading} value={inventoryForm.productName} onChange={(e) => setInventoryForm({ ...inventoryForm, productName: e.target.value })} /></label>
                  <label className="auth-label">Bodega <input type="text" className="auth-input" required disabled={inventoryLoading} value={inventoryForm.warehouseCode} onChange={(e) => setInventoryForm({ ...inventoryForm, warehouseCode: e.target.value })} /></label>
                  <label className="auth-label">Cantidad <input type="number" min="0" className="auth-input" required disabled={inventoryLoading} value={inventoryForm.initialQuantity} onChange={(e) => setInventoryForm({ ...inventoryForm, initialQuantity: e.target.value })} /></label>
                  <label className="auth-label">Reorden <input type="number" min="0" className="auth-input" required disabled={inventoryLoading} value={inventoryForm.reorderLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: e.target.value })} /></label>
                </div>
                <div className="col-span-all">
                  <button type="submit" className={`auth-submit-btn btn-inventory ${inventoryLoading ? "loading" : ""}`} disabled={inventoryLoading}>
                    {inventoryLoading ? "Registrando..." : "Registrar Producto"}
                  </button>
                  <FormAlert status={inventoryStatus} />
                </div>
              </form>

              <div className="grid-autofit">
                <form onSubmit={handleInventoryUpdateSubmit} className="service-card-form">
                  <h3 className="subtitle-common title-inventory">Actualizar Inventario</h3>
                  <label className="auth-label">SKU del Producto <input type="text" className="auth-input" required placeholder="Ej: LAP-001" disabled={inventoryUpdateLoading} value={inventoryUpdateForm.sku} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, sku: e.target.value })} /></label>
                  <label className="auth-label">Nombre <input type="text" className="auth-input" required disabled={inventoryUpdateLoading} value={inventoryUpdateForm.productName} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, productName: e.target.value })} /></label>
                  <label className="auth-label">Cantidad Disponible <input type="number" min="0" className="auth-input" required disabled={inventoryUpdateLoading} value={inventoryUpdateForm.availableQuantity} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, availableQuantity: e.target.value })} /></label>
                  <label className="auth-label">Cantidad Reservada <input type="number" min="0" className="auth-input" required disabled={inventoryUpdateLoading} value={inventoryUpdateForm.reservedQuantity} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, reservedQuantity: e.target.value })} /></label>
                  <label className="auth-label">Nivel de Reorden <input type="number" min="0" className="auth-input" required disabled={inventoryUpdateLoading} value={inventoryUpdateForm.reorderLevel} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, reorderLevel: e.target.value })} /></label>
                  <button type="submit" className={`auth-submit-btn btn-inventory mt-auto ${inventoryUpdateLoading ? "loading" : ""}`} disabled={inventoryUpdateLoading}>
                    {inventoryUpdateLoading ? "Actualizando..." : "Actualizar Producto"}
                  </button>
                  <FormAlert status={inventoryUpdateStatus} />
                </form>

                <form onSubmit={handleInventoryDeleteSubmit} className="service-card-form danger">
                  <h3 className="title-danger">Zona de Peligro (Eliminar)</h3>
                  <label className="auth-label text-danger-light">SKU a Eliminar
                    <input type="text" className="auth-input input-danger" required placeholder="Ej: LAP-001" disabled={inventoryDeleteLoading} value={inventoryDeleteForm.sku} onChange={(e) => setInventoryDeleteForm({ ...inventoryDeleteForm, sku: e.target.value })} />
                  </label>
                  <p className="danger-warning-text">⚠️ Atención: Esta acción removerá el producto de la base de datos de manera irreversible.</p>
                  <button type="submit" className={`logout-btn btn-danger-large mt-auto ${inventoryDeleteLoading ? "loading" : ""}`} disabled={inventoryDeleteLoading}>
                    {inventoryDeleteLoading ? "Eliminando..." : "Eliminar Definitivamente"}
                  </button>
                  <FormAlert status={inventoryDeleteStatus} />
                </form>
              </div>
            </div>
          </section>
        )}

        {/* 2. MÓDULO DE ÓRDENES */}
        {(role === "ROLE_ADMIN" || role === "ROLE_ORDER_MANAGER") && (
          <section className="inventory-table-section section-orders">
            <div className="table-header"><h2 className="title-orders">Módulo de Órdenes</h2></div>
            <div className="flex-col-gap-35">
              
              <form onSubmit={handleOrderSubmit} className="flex-col-gap-20">
                <h3 className="subtitle-orders">Crear Nueva Orden</h3>
                <div className="grid-1-1">
                  <label className="auth-label">Cliente <input type="text" className="auth-input" required disabled={orderLoading} value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} /></label>
                  <label className="auth-label">Correo
                    <div className="flex-row-gap-5">
                      <input type="text" className="auth-input" required disabled={orderLoading} value={orderForm.customerEmail} onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })} />
                      <button type="button" onClick={insertAtSymbol} className="nav-btn" disabled={orderLoading || orderForm.customerEmail.includes("@")}>@</button>
                    </div>
                  </label>
                  <label className="auth-label col-span-all">Dirección <input type="text" className="auth-input" required disabled={orderLoading} value={orderForm.shippingAddress} onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })} /></label>
                </div>
                
                <div className="order-lines-box">
                  <div className="order-lines-header">
                    <h4>Líneas de Producto ({orderForm.lines.length})</h4>
                    <button type="button" className="nav-btn" onClick={handleAddOrderLine} disabled={orderLoading}>+ Agregar Línea</button>
                  </div>
                  {orderForm.lines.map((line, index) => (
                    <div key={index} className="grid-1-1-1-auto">
                      <label className="auth-label">SKU <input type="text" className="auth-input" required disabled={orderLoading} value={line.sku} onChange={(e) => handleOrderLineChange(index, "sku", e.target.value)} /></label>
                      <label className="auth-label">Cantidad <input type="number" min="1" className="auth-input" required disabled={orderLoading} value={line.quantity} onChange={(e) => handleOrderLineChange(index, "quantity", e.target.value)} /></label>
                      <label className="auth-label">Precio <input type="number" min="0.01" step="0.01" className="auth-input" required disabled={orderLoading} value={line.unitPrice} onChange={(e) => handleOrderLineChange(index, "unitPrice", e.target.value)} /></label>
                      {orderForm.lines.length > 1 && <button type="button" className="logout-btn" disabled={orderLoading} onClick={() => handleRemoveOrderLine(index)}>X</button>}
                    </div>
                  ))}
                </div>
                <button type="submit" className={`auth-submit-btn btn-orders ${orderLoading ? "loading" : ""}`} disabled={orderLoading}>
                  {orderLoading ? "Creando..." : "Crear Orden"}
                </button>
                <FormAlert status={orderStatus} />
              </form>

              <div className="grid-autofit">
                <form onSubmit={handleOrderStatusUpdateSubmit} className="service-card-form">
                  <h3 className="subtitle-orders subtitle-common">Actualizar Estado de Orden</h3>
                  <label className="auth-label">Número de Orden <input type="text" className="auth-input" required placeholder="ORD-XXXX" disabled={orderStatusUpdateLoading} value={orderStatusUpdateForm.orderNumber} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, orderNumber: e.target.value })} /></label>
                  <label className="auth-label">Nuevo Estado
                    <select className="auth-input bg-slate-800" disabled={orderStatusUpdateLoading} value={orderStatusUpdateForm.status} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, status: e.target.value })}>
                      {ORDER_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="auth-label">Tracking Code (Opcional) <input type="text" className="auth-input" placeholder="TRK-XXX" disabled={orderStatusUpdateLoading} value={orderStatusUpdateForm.trackingCode} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, trackingCode: e.target.value })} /></label>
                  <label className="auth-label">Razón / Motivo (Opcional) <input type="text" className="auth-input" placeholder="Ej: Pago validado" disabled={orderStatusUpdateLoading} value={orderStatusUpdateForm.reason} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, reason: e.target.value })} /></label>
                  <button type="submit" className={`auth-submit-btn btn-orders-full mt-auto ${orderStatusUpdateLoading ? "loading" : ""}`} disabled={orderStatusUpdateLoading}>
                    {orderStatusUpdateLoading ? "Actualizando..." : "Actualizar Estado"}
                  </button>
                  <FormAlert status={orderStatusUpdateStatus} />
                </form>

                <form onSubmit={handleOrderDeleteSubmit} className="service-card-form danger">
                  <h3 className="title-danger">Zona de Peligro (Eliminar Orden)</h3>
                  <label className="auth-label text-danger-light">Número de Orden a Eliminar
                    <input type="text" className="auth-input input-danger" required placeholder="ORD-XXXX" disabled={orderDeleteLoading} value={orderDeleteForm.orderNumber} onChange={(e) => setOrderDeleteForm({ ...orderDeleteForm, orderNumber: e.target.value })} />
                  </label>
                  <p className="danger-warning-text">⚠️ Atención: Esta acción removerá la orden de la base de datos de manera irreversible.</p>
                  <button type="submit" className={`logout-btn btn-danger-large mt-auto ${orderDeleteLoading ? "loading" : ""}`} disabled={orderDeleteLoading}>
                    {orderDeleteLoading ? "Eliminando..." : "Eliminar Definitivamente"}
                  </button>
                  <FormAlert status={orderDeleteStatus} />
                </form>
              </div>
            </div>
          </section>
        )}

        {/* 3. LOGÍSTICA Y ENVÍOS */}
        {(role === "ROLE_ADMIN" || role === "ROLE_SHIPMENT_MANAGER") && (
          <section className="inventory-table-section section-shipments">
            <div className="table-header"><h2 className="title-shipments">Módulo de Logística y Envíos</h2></div>
            <div className="grid-autofit">
              
              <form onSubmit={handleShipmentCreateSubmit} className="service-card-form">
                <h3 className="subtitle-common">Generar Nuevo Envío</h3>
                <label className="auth-label">Número de Orden <input type="text" className="auth-input" required disabled={shipmentCreateLoading} value={shipmentCreateForm.orderNumber} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, orderNumber: e.target.value })} /></label>
                <label className="auth-label">Dirección <input type="text" className="auth-input" required disabled={shipmentCreateLoading} value={shipmentCreateForm.destinationAddress} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, destinationAddress: e.target.value })} /></label>
                <label className="auth-label">Unidades <input type="number" min="1" className="auth-input" required disabled={shipmentCreateLoading} value={shipmentCreateForm.totalUnits} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, totalUnits: safeNumber(e.target.value, 1) })} /></label>
                <button type="submit" className={`auth-submit-btn btn-shipments mt-auto ${shipmentCreateLoading ? "loading" : ""}`} disabled={shipmentCreateLoading}>
                  {shipmentCreateLoading ? "Generando..." : "Generar Envío"}
                </button>
                <FormAlert status={shipmentCreateStatus} />
              </form>

              <form onSubmit={handleShipmentStatusUpdateSubmit} className="service-card-form">
                <h3 className="subtitle-common">Actualización Rápida (Estado)</h3>
                <label className="auth-label">Tracking Code <input type="text" className="auth-input" required placeholder="TRK-XXX" disabled={shipmentStatusUpdateLoading} value={shipmentStatusForm.trackingCode} onChange={(e) => setShipmentStatusForm({ ...shipmentStatusForm, trackingCode: e.target.value })} /></label>
                <label className="auth-label">Nuevo Estado
                  <select className="auth-input bg-slate-800" disabled={shipmentStatusUpdateLoading} value={shipmentStatusForm.status} onChange={(e) => setShipmentStatusForm({ ...shipmentStatusForm, status: e.target.value })}>
                    {SHIPMENT_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <button type="submit" className={`auth-submit-btn btn-shipments-status mt-auto ${shipmentStatusUpdateLoading ? "loading" : ""}`} disabled={shipmentStatusUpdateLoading}>
                  {shipmentStatusUpdateLoading ? "Actualizando..." : "Actualizar Solo Estado"}
                </button>
                <FormAlert status={shipmentStatusUpdateStatus} />
              </form>

              <form onSubmit={handleShipmentUpdateSubmit} className="service-card-form full-width">
                <h3 className="subtitle-common">Edición Completa del Envío</h3>
                <div className="grid-autofit-small">
                  <label className="auth-label">Tracking Code <input type="text" className="auth-input" required placeholder="TRK-XXX" disabled={shipmentUpdateLoading} value={shipmentUpdateForm.trackingCode} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, trackingCode: e.target.value })} /></label>
                  <label className="auth-label">Estado
                    <select className="auth-input bg-slate-800" disabled={shipmentUpdateLoading} value={shipmentUpdateForm.status} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, status: e.target.value })}>
                      {SHIPMENT_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="auth-label">Transportista <input type="text" className="auth-input" placeholder="Ej: FedEx" disabled={shipmentUpdateLoading} value={shipmentUpdateForm.carrier} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, carrier: e.target.value })} /></label>
                  <label className="auth-label">Ruta <input type="text" className="auth-input" placeholder="Ej: RT-99" disabled={shipmentUpdateLoading} value={shipmentUpdateForm.routeCode} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, routeCode: e.target.value })} /></label>
                  <label className="auth-label">Fecha de Entrega <input type="date" className="auth-input" disabled={shipmentUpdateLoading} value={shipmentUpdateForm.estimatedDeliveryDate} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, estimatedDeliveryDate: e.target.value })} /></label>
                </div>
                <button type="submit" className={`auth-submit-btn btn-shipments-save ${shipmentUpdateLoading ? "loading" : ""}`} disabled={shipmentUpdateLoading}>
                  {shipmentUpdateLoading ? "Guardando..." : "Guardar Todos los Cambios"}
                </button>
                <FormAlert status={shipmentUpdateStatus} />
              </form>

              <form onSubmit={handleShipmentDeleteSubmit} className="service-card-form full-width danger">
                <h3 className="title-danger">Zona de Peligro (Eliminar)</h3>
                <div className="flex-row-end-gap-15">
                  <label className="auth-label flex-1 text-danger-light">Tracking Code a Eliminar
                    <input type="text" className="auth-input input-danger" required placeholder="TRK-XXX" disabled={shipmentDeleteLoading} value={shipmentDeleteForm.trackingCode} onChange={(e) => setShipmentDeleteForm({ ...shipmentDeleteForm, trackingCode: e.target.value })} />
                  </label>
                  <button type="submit" className={`logout-btn btn-danger-large-no-mt ${shipmentDeleteLoading ? "loading" : ""}`} disabled={shipmentDeleteLoading}>
                    {shipmentDeleteLoading ? "Eliminando..." : "Eliminar Definitivamente"}
                  </button>
                </div>
                <FormAlert status={shipmentDeleteStatus} />
              </form>

            </div>
          </section>
        )}

        {/* 4. GESTIÓN DE USUARIOS */}
        {role === "ROLE_ADMIN" && (
          <section className="inventory-table-section section-users">
            <div className="table-header"><h2 className="title-users">Módulo de Administración</h2></div>
            {usersLoading ? (
              <div className="loading-text-users">Sincronizando con Auth...</div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead className="users-table-head">
                    <tr>
                      <th className="users-th">Usuario</th>
                      <th className="users-th">Correo</th>
                      <th className="users-th-wide">Rol Asignado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="users-tr">
                        <td className="users-td">{u.username}</td>
                        <td className="users-td-muted">{u.email}</td>
                        <td className="users-td">
                          <select className="auth-input bg-slate-900" value={u.role || ""} onChange={(e) => handleRoleChange(u.id, u, e.target.value)}>
                            <option value="" disabled hidden>Seleccione un Rol</option>
                            {ROLES_LIST.map((r) => (<option key={r} value={r}>{r}</option>))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <FormAlert status={usersStatus} />
          </section>
        )}

      </div>
    </div>
  );
}

export default ServicesPage;