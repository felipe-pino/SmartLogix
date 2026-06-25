import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  createInventoryItemRequest, updateInventoryItemRequest, deleteInventoryItemRequest
} from "../API/inventoryApi";
import {
  createOrderRequest, updateOrderStatusRequest, deleteOrderRequest
} from "../API/orderApi";
import { getAllUsersRequest, updateUserRequest } from "../API/authApi";
import {
  createShipmentRequest, updateShipmentRequest, updateShipmentStatusRequest, deleteShipmentRequest
} from "../API/shipmentApi";
import "../App.css";

// ==========================================
// ESTADO INICIAL DE LOS FORMULARIOS
// ==========================================
const INITIAL_INVENTORY = { sku: "", productName: "", warehouseCode: "", initialQuantity: 0, reorderLevel: 0 };
const INITIAL_INVENTORY_UPDATE = { sku: "", productName: "", availableQuantity: 0, reservedQuantity: 0, reorderLevel: 0 };
const INITIAL_INVENTORY_DELETE = { sku: "" };

const INITIAL_ORDER = { customerName: "", customerEmail: "", shippingAddress: "", lines: [{ sku: "", quantity: 1, unitPrice: 0.01 }] };
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
const safeNumber = (value, fallback = 0) => { const parsed = Number(value); return isNaN(parsed) ? fallback : parsed; };
const safeFloat = (value, fallback = 0.01) => { const parsed = parseFloat(value); return isNaN(parsed) ? fallback : parsed; };
const normalizeEmail = (email) => {
  const trimmed = email.trim();
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) return `${trimmed}@cliente.com`;
  if (atCount > 1) { const [local, ...rest] = trimmed.split("@"); return `${local}@${rest.join("")}`; }
  return trimmed;
};

// ==========================================
// COMPONENTE DE ALERTAS
// ==========================================
function FormAlert({ status }) {
  if (!status) return null;
  return <div className={`auth-alert ${status.type === "success" ? "success" : "error"}`}>{status.message}</div>;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function ServicesPage() {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || "ROLE_USER";

  // Estados de formularios
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

  // Gestor unificado de carga y errores
  const [loadingStates, setLoadingStates] = useState({});
  const [statusMessages, setStatusMessages] = useState({});

  const setLoading = (key, value) => setLoadingStates(prev => ({ ...prev, [key]: value }));
  const setStatus = (key, value) => setStatusMessages(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading('users', true);
      try {
        const usersData = await getAllUsersRequest();
        setUsers(usersData || []);
      } catch (error) {
        setStatus('users', { type: "error", message: "Error al sincronizar usuarios." });
      } finally {
        setLoading('users', false);
      }
    };
    if (role === "ROLE_ADMIN") loadAdminData();
  }, [role]);

  // =========================================================
  // SUBMITS INVENTARIO
  // =========================================================
  const handleInventorySubmit = async (e) => {
    e.preventDefault(); setStatus('invCreate', null); setLoading('invCreate', true);
    try {
      await createInventoryItemRequest({
        sku: inventoryForm.sku.trim().toUpperCase(), productName: inventoryForm.productName.trim(),
        warehouseCode: inventoryForm.warehouseCode.trim().toUpperCase(),
        initialQuantity: safeNumber(inventoryForm.initialQuantity), reorderLevel: safeNumber(inventoryForm.reorderLevel),
      });
      setStatus('invCreate', { type: "success", message: `Producto registrado.` });
      setInventoryForm(INITIAL_INVENTORY);
    } catch (error) { setStatus('invCreate', { type: "error", message: error.message }); }
    finally { setLoading('invCreate', false); }
  };

  const handleInventoryUpdateSubmit = async (e) => {
    e.preventDefault(); setStatus('invUpdate', null);
    const sku = inventoryUpdateForm.sku.trim().toUpperCase();
    if (!sku) return setStatus('invUpdate', { type: "error", message: "SKU obligatorio." });
    setLoading('invUpdate', true);
    try {
      await updateInventoryItemRequest(sku, {
        productName: inventoryUpdateForm.productName.trim(), availableQuantity: safeNumber(inventoryUpdateForm.availableQuantity),
        reservedQuantity: safeNumber(inventoryUpdateForm.reservedQuantity), reorderLevel: safeNumber(inventoryUpdateForm.reorderLevel),
      });
      setStatus('invUpdate', { type: "success", message: `Producto actualizado.` });
      setInventoryUpdateForm(INITIAL_INVENTORY_UPDATE);
    } catch (error) { setStatus('invUpdate', { type: "error", message: error.message }); }
    finally { setLoading('invUpdate', false); }
  };

  const handleInventoryDeleteSubmit = async (e) => {
    e.preventDefault(); setStatus('invDelete', null);
    const sku = inventoryDeleteForm.sku.trim().toUpperCase();
    if (!sku) return;
    if (!window.confirm(`¿Eliminar definitivamente el producto ${sku}?`)) return;
    setLoading('invDelete', true);
    try {
      await deleteInventoryItemRequest(sku);
      setStatus('invDelete', { type: "success", message: `Producto eliminado.` });
      setInventoryDeleteForm(INITIAL_INVENTORY_DELETE);
    } catch (error) { setStatus('invDelete', { type: "error", message: error.message }); }
    finally { setLoading('invDelete', false); }
  };

  // =========================================================
  // SUBMITS ÓRDENES
  // =========================================================
  const handleAddOrderLine = () => setOrderForm(prev => ({ ...prev, lines: [...prev.lines, { sku: "", quantity: 1, unitPrice: 0.01 }] }));
  const handleOrderLineChange = (index, field, value) => setOrderForm(prev => ({ ...prev, lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line) }));
  const handleRemoveOrderLine = (index) => setOrderForm(prev => ({ ...prev, lines: prev.lines.length <= 1 ? prev.lines : prev.lines.filter((_, i) => i !== index) }));
  const insertAtSymbol = () => setOrderForm((prev) => prev.customerEmail.includes("@") ? prev : { ...prev, customerEmail: prev.customerEmail + "@" });

  const handleOrderSubmit = async (e) => {
    e.preventDefault(); setStatus('ordCreate', null); setLoading('ordCreate', true);
    try {
      await createOrderRequest({
        customerName: orderForm.customerName.trim(), customerEmail: normalizeEmail(orderForm.customerEmail), shippingAddress: orderForm.shippingAddress.trim(),
        lines: orderForm.lines.map(line => ({ sku: line.sku.trim().toUpperCase(), quantity: safeNumber(line.quantity, 1), unitPrice: safeFloat(line.unitPrice, 0.01) }))
      });
      setStatus('ordCreate', { type: "success", message: `Orden creada para "${orderForm.customerName.trim()}".` });
      setOrderForm(INITIAL_ORDER);
    } catch (error) {
      let friendlyMessage = "";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          friendlyMessage = error.response.data;
        } else if (error.response.data.message) {
          friendlyMessage = error.response.data.message;
        } else if (error.response.data.error) {
          friendlyMessage = error.response.data.error;
        }
      }
      if (!friendlyMessage || friendlyMessage.includes("500")) {
        friendlyMessage = error.message && !error.message.includes("500")
            ? error.message
            : "Stock insuficiente o error interno en el procesamiento de la orden.";
      }
      setStatus('ordCreate', { type: "error", message: `⚠️ Reintento Fallido: ${friendlyMessage}` });
    }
    finally { setLoading('ordCreate', false); }
  };

  const handleOrderStatusUpdateSubmit = async (e) => {
    e.preventDefault(); setStatus('ordUpdate', null);
    const orderNum = orderStatusUpdateForm.orderNumber.trim();
    if (!orderNum) return setStatus('ordUpdate', { type: "error", message: "Número de Orden obligatorio." });

    setLoading('ordUpdate', true);
    const trackingValue = orderStatusUpdateForm.trackingCode.trim();
    const reasonValue = orderStatusUpdateForm.reason.trim();

    try {
      await updateOrderStatusRequest(orderNum, {
        status: orderStatusUpdateForm.status,
        trackingCode: trackingValue === "" ? null : trackingValue,
        reason: reasonValue === "" ? null : reasonValue,
      });
      setStatus('ordUpdate', { type: "success", message: `Orden ${orderNum} actualizada.` });
      setOrderStatusUpdateForm(INITIAL_ORDER_STATUS_UPDATE);
    } catch (error) { setStatus('ordUpdate', { type: "error", message: error.message || "Error al actualizar." }); }
    finally { setLoading('ordUpdate', false); }
  };

  const handleOrderDeleteSubmit = async (e) => {
    e.preventDefault(); setStatus('ordDelete', null);
    const orderNum = orderDeleteForm.orderNumber.trim();
    if (!orderNum) return;
    if (!window.confirm(`¿Seguro que deseas eliminar definitivamente la orden ${orderNum}?`)) return;

    setLoading('ordDelete', true);
    try {
      await deleteOrderRequest(orderNum);
      setStatus('ordDelete', { type: "success", message: `Orden ${orderNum} eliminada.` });
      setOrderDeleteForm(INITIAL_ORDER_DELETE);
    } catch (error) { setStatus('ordDelete', { type: "error", message: error.message }); }
    finally { setLoading('ordDelete', false); }
  };

  // =========================================================
  // SUBMITS LOGÍSTICA Y ENVÍOS
  // =========================================================
  const handleShipmentCreateSubmit = async (e) => {
    e.preventDefault(); setStatus('shipCreate', null); setLoading('shipCreate', true);
    try {
      await createShipmentRequest({
        orderNumber: shipmentCreateForm.orderNumber.trim(), destinationAddress: shipmentCreateForm.destinationAddress.trim(), totalUnits: safeNumber(shipmentCreateForm.totalUnits, 1)
      });
      setStatus('shipCreate', { type: "success", message: `Envío generado para orden "${shipmentCreateForm.orderNumber.trim()}".` });
      setShipmentCreateForm(INITIAL_SHIPMENT_CREATE);
    } catch (error) { setStatus('shipCreate', { type: "error", message: error.message }); }
    finally { setLoading('shipCreate', false); }
  };

  const handleShipmentStatusUpdateSubmit = async (e) => {
    e.preventDefault(); setStatus('shipStatus', null);
    const code = shipmentStatusForm.trackingCode.trim().toUpperCase();
    if (!code) return;

    setLoading('shipStatus', true);
    try {
      await updateShipmentStatusRequest(code, shipmentStatusForm.status);
      setStatus('shipStatus', { type: "success", message: `Estado de ${code} actualizado a ${shipmentStatusForm.status}.` });
      setShipmentStatusForm(INITIAL_SHIPMENT_STATUS);
    } catch (error) { setStatus('shipStatus', { type: "error", message: error.message }); }
    finally { setLoading('shipStatus', false); }
  };

  const handleShipmentUpdateSubmit = async (e) => {
    e.preventDefault(); setStatus('shipUpdate', null);
    const code = shipmentUpdateForm.trackingCode.trim().toUpperCase();
    if (!code) return;

    setLoading('shipUpdate', true);
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
      setStatus('shipUpdate', { type: "success", message: `Envío ${code} actualizado.` });
      setShipmentUpdateForm(INITIAL_SHIPMENT_UPDATE);
    } catch (error) { setStatus('shipUpdate', { type: "error", message: error.message }); }
    finally { setLoading('shipUpdate', false); }
  };

  const handleShipmentDeleteSubmit = async (e) => {
    e.preventDefault(); setStatus('shipDelete', null);
    const code = shipmentDeleteForm.trackingCode.trim().toUpperCase();
    if (!code) return;
    if (!window.confirm(`¿Seguro que deseas eliminar el envío ${code}?`)) return;

    setLoading('shipDelete', true);
    try {
      await deleteShipmentRequest(code);
      setStatus('shipDelete', { type: "success", message: `Envío ${code} eliminado.` });
      setShipmentDeleteForm(INITIAL_SHIPMENT_DELETE);
    } catch (error) { setStatus('shipDelete', { type: "error", message: error.message }); }
    finally { setLoading('shipDelete', false); }
  };

  // =========================================================
  // SUBMITS ADMIN (USUARIOS)
  // =========================================================
  const handleRoleChange = async (userId, userCurrentData, newRole) => {
    setStatus('users', null);
    const previousUsers = [...users];
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await updateUserRequest(userId, {
        username: userCurrentData.username,
        email: userCurrentData.email,
        role: newRole,
        enabled: userCurrentData.enabled !== undefined ? userCurrentData.enabled : true
      });
      setStatus('users', { type: "success", message: `Rol actualizado a "${newRole}".` });
    } catch (error) {
      setUsers(previousUsers);
      setStatus('users', { type: "error", message: error.message || "Error al cambiar rol." });
    }
  };

  if (role === "ROLE_USER") {
    return (
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <div className="container access-denied anim-scale-in">
              <h1 className="access-denied-title">Acceso Restringido</h1>
              <p className="access-denied-text">Tu perfil actual no tiene permisos para operar los servicios del sistema.</p>
              <button className="logout-btn btn-mt-30" onClick={() => navigate("/inventory")}>
                Volver al Inicio
              </button>
            </div>
          </main>
        </div>
    );
  }

  return (
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <div className="inventory-container anim-fade-up">
            <header className="inventory-header">
              <h1>Panel de Servicios Operativos</h1>
              <p>Herramientas autorizadas para: <strong style={{color: 'var(--color-primary)'}}>{role}</strong></p>
            </header>

            <div className="services-layout">

              {/* 1. MÓDULO DE INVENTARIO */}
              {(role === "ROLE_ADMIN" || role === "ROLE_INVENTORY_MANAGER" || role === "ROLE_WAREHOUSE_MANAGER") && (
                  <section className="inventory-table-section anim-fade-up delay-1">
                    <div className="table-header"><h2 className="title-inventory">Gestión de Inventario</h2></div>
                    <div className="flex-col-gap-35">
                      <form onSubmit={handleInventorySubmit} className="flex-col-gap-20">
                        <h3 className="subtitle-common">Crear Nuevo Producto</h3>
                        <div className="grid-1-1">
                          <label className="auth-label">SKU <input type="text" className="auth-input" required value={inventoryForm.sku} onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })} /></label>
                          <label className="auth-label">Nombre <input type="text" className="auth-input" required value={inventoryForm.productName} onChange={(e) => setInventoryForm({ ...inventoryForm, productName: e.target.value })} /></label>
                          <label className="auth-label">Bodega <input type="text" className="auth-input" required value={inventoryForm.warehouseCode} onChange={(e) => setInventoryForm({ ...inventoryForm, warehouseCode: e.target.value })} /></label>
                          <label className="auth-label">Cantidad <input type="number" min="0" className="auth-input" required value={inventoryForm.initialQuantity} onChange={(e) => setInventoryForm({ ...inventoryForm, initialQuantity: e.target.value })} /></label>
                          <label className="auth-label">Reorden <input type="number" min="0" className="auth-input" required value={inventoryForm.reorderLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: e.target.value })} /></label>
                        </div>
                        <button type="submit" className={`auth-submit-btn ${loadingStates.invCreate ? "loading" : ""}`} disabled={loadingStates.invCreate}>Registrar Producto</button>
                        <FormAlert status={statusMessages.invCreate} />
                      </form>

                      <div className="grid-autofit">
                        <form onSubmit={handleInventoryUpdateSubmit} className="service-card-form">
                          <h3 className="subtitle-common">Actualizar Inventario</h3>
                          <label className="auth-label">SKU <input type="text" className="auth-input" required value={inventoryUpdateForm.sku} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, sku: e.target.value })} /></label>
                          <label className="auth-label">Stock Disp. <input type="number" min="0" className="auth-input" required value={inventoryUpdateForm.availableQuantity} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, availableQuantity: e.target.value })} /></label>
                          <label className="auth-label">Stock Reservado <input type="number" min="0" className="auth-input" required value={inventoryUpdateForm.reservedQuantity} onChange={(e) => setInventoryUpdateForm({ ...inventoryUpdateForm, reservedQuantity: e.target.value })} /></label>
                          <button type="submit" className={`auth-submit-btn mt-auto ${loadingStates.invUpdate ? "loading" : ""}`} disabled={loadingStates.invUpdate}>Actualizar</button>
                          <FormAlert status={statusMessages.invUpdate} />
                        </form>

                        <form onSubmit={handleInventoryDeleteSubmit} className="service-card-form danger">
                          <h3 className="title-danger">Zona de Peligro</h3>
                          <label className="auth-label text-danger-light">SKU a Eliminar <input type="text" className="auth-input input-danger" required value={inventoryDeleteForm.sku} onChange={(e) => setInventoryDeleteForm({ ...inventoryDeleteForm, sku: e.target.value })} /></label>
                          <button type="submit" className={`btn-danger-large ${loadingStates.invDelete ? "loading" : ""}`} disabled={loadingStates.invDelete}>Eliminar Definitivamente</button>
                          <FormAlert status={statusMessages.invDelete} />
                        </form>
                      </div>
                    </div>
                  </section>
              )}

              {/* 2. MÓDULO DE ÓRDENES */}
              {(role === "ROLE_ADMIN" || role === "ROLE_ORDER_MANAGER") && (
                  <section className="inventory-table-section anim-fade-up delay-2">
                    <div className="table-header"><h2 className="title-orders">Gestión de Órdenes</h2></div>
                    <div className="flex-col-gap-35">
                      <form onSubmit={handleOrderSubmit} className="flex-col-gap-20">
                        <h3 className="subtitle-common">Crear Nueva Orden</h3>
                        <div className="grid-1-1">
                          <label className="auth-label">Cliente <input type="text" className="auth-input" required value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} /></label>
                          <label className="auth-label">Correo
                            <div className="flex-row-gap-5" style={{display: 'flex', gap: '5px'}}>
                              <input type="text" className="auth-input" required value={orderForm.customerEmail} onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })} />
                              <button type="button" onClick={insertAtSymbol} className="nav-btn" disabled={loadingStates.ordCreate || orderForm.customerEmail.includes("@")}>@</button>
                            </div>
                          </label>
                          <label className="auth-label col-span-all">Dirección <input type="text" className="auth-input" required value={orderForm.shippingAddress} onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })} /></label>
                        </div>

                        <div className="order-lines-box">
                          <div className="order-lines-header" style={{display: 'flex', justifyContent: 'space-between'}}>
                            <h4 style={{color: 'white'}}>Líneas ({orderForm.lines.length})</h4>
                            <button type="button" className="nav-btn" onClick={handleAddOrderLine}>+ Línea</button>
                          </div>
                          {orderForm.lines.map((line, index) => (
                              <div key={index} className="grid-1-1-1-auto" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <label className="auth-label" style={{flex: 1}}>SKU <input type="text" className="auth-input" required value={line.sku} onChange={(e) => handleOrderLineChange(index, "sku", e.target.value)} /></label>
                                <label className="auth-label" style={{flex: 1}}>Cant. <input type="number" min="1" className="auth-input" required value={line.quantity} onChange={(e) => handleOrderLineChange(index, "quantity", e.target.value)} /></label>
                                <label className="auth-label" style={{flex: 1}}>Precio <input type="number" min="0.01" step="0.01" className="auth-input" required value={line.unitPrice} onChange={(e) => handleOrderLineChange(index, "unitPrice", e.target.value)} /></label>
                                {orderForm.lines.length > 1 && <button type="button" className="logout-btn" style={{marginTop: 'auto'}} onClick={() => handleRemoveOrderLine(index)}>X</button>}
                              </div>
                          ))}
                        </div>
                        <button type="submit" className={`auth-submit-btn ${loadingStates.ordCreate ? "loading" : ""}`} disabled={loadingStates.ordCreate}>Generar Orden</button>
                        <FormAlert status={statusMessages.ordCreate} />
                      </form>

                      {/* Formularios restaurados de Órdenes */}
                      <div className="grid-autofit">
                        <form onSubmit={handleOrderStatusUpdateSubmit} className="service-card-form">
                          <h3 className="subtitle-common">Actualizar Estado de Orden</h3>
                          <label className="auth-label">N° de Orden <input type="text" className="auth-input" required placeholder="ORD-XXXX" value={orderStatusUpdateForm.orderNumber} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, orderNumber: e.target.value })} /></label>
                          <label className="auth-label">Nuevo Estado
                            <select className="auth-input" value={orderStatusUpdateForm.status} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, status: e.target.value })}>
                              {ORDER_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </label>
                          <label className="auth-label">Tracking Code <input type="text" className="auth-input" placeholder="Opcional" value={orderStatusUpdateForm.trackingCode} onChange={(e) => setOrderStatusUpdateForm({ ...orderStatusUpdateForm, trackingCode: e.target.value })} /></label>
                          <button type="submit" className={`auth-submit-btn mt-auto ${loadingStates.ordUpdate ? "loading" : ""}`} disabled={loadingStates.ordUpdate}>Actualizar Estado</button>
                          <FormAlert status={statusMessages.ordUpdate} />
                        </form>

                        <form onSubmit={handleOrderDeleteSubmit} className="service-card-form danger">
                          <h3 className="title-danger">Zona de Peligro</h3>
                          <label className="auth-label text-danger-light">N° de Orden a Eliminar
                            <input type="text" className="auth-input input-danger" required placeholder="ORD-XXXX" value={orderDeleteForm.orderNumber} onChange={(e) => setOrderDeleteForm({ ...orderDeleteForm, orderNumber: e.target.value })} />
                          </label>
                          <button type="submit" className={`btn-danger-large mt-auto ${loadingStates.ordDelete ? "loading" : ""}`} disabled={loadingStates.ordDelete}>Eliminar Definitivamente</button>
                          <FormAlert status={statusMessages.ordDelete} />
                        </form>
                      </div>

                    </div>
                  </section>
              )}

              {/* 3. MÓDULO DE ENVÍOS */}
              {(role === "ROLE_ADMIN" || role === "ROLE_SHIPMENT_MANAGER") && (
                  <section className="inventory-table-section anim-fade-up delay-3">
                    <div className="table-header"><h2 className="title-shipments">Gestión de Envíos</h2></div>
                    <div className="grid-autofit">

                      <form onSubmit={handleShipmentCreateSubmit} className="service-card-form">
                        <h3 className="subtitle-common">Generar Envío</h3>
                        <label className="auth-label">N° Orden <input type="text" className="auth-input" required value={shipmentCreateForm.orderNumber} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, orderNumber: e.target.value })} /></label>
                        <label className="auth-label">Dirección <input type="text" className="auth-input" required value={shipmentCreateForm.destinationAddress} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, destinationAddress: e.target.value })} /></label>
                        <label className="auth-label">Unidades <input type="number" min="1" className="auth-input" required value={shipmentCreateForm.totalUnits} onChange={(e) => setShipmentCreateForm({ ...shipmentCreateForm, totalUnits: safeNumber(e.target.value, 1) })} /></label>
                        <button type="submit" className={`auth-submit-btn mt-auto ${loadingStates.shipCreate ? "loading" : ""}`} disabled={loadingStates.shipCreate}>Generar</button>
                        <FormAlert status={statusMessages.shipCreate} />
                      </form>

                      <form onSubmit={handleShipmentStatusUpdateSubmit} className="service-card-form">
                        <h3 className="subtitle-common">Actualización Rápida (Estado)</h3>
                        <label className="auth-label">Tracking Code <input type="text" className="auth-input" required placeholder="TRK-XXX" value={shipmentStatusForm.trackingCode} onChange={(e) => setShipmentStatusForm({ ...shipmentStatusForm, trackingCode: e.target.value })} /></label>
                        <label className="auth-label">Nuevo Estado
                          <select className="auth-input" value={shipmentStatusForm.status} onChange={(e) => setShipmentStatusForm({ ...shipmentStatusForm, status: e.target.value })}>
                            {SHIPMENT_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                        <button type="submit" className={`auth-submit-btn mt-auto ${loadingStates.shipStatus ? "loading" : ""}`} disabled={loadingStates.shipStatus}>Actualizar Estado</button>
                        <FormAlert status={statusMessages.shipStatus} />
                      </form>

                      {/* Formularios restaurados de Envíos */}
                      <form onSubmit={handleShipmentUpdateSubmit} className="service-card-form full-width" style={{gridColumn: '1 / -1'}}>
                        <h3 className="subtitle-common">Edición Completa del Envío</h3>
                        <div className="grid-autofit-small" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px'}}>
                          <label className="auth-label">Tracking Code <input type="text" className="auth-input" required placeholder="TRK-XXX" value={shipmentUpdateForm.trackingCode} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, trackingCode: e.target.value })} /></label>
                          <label className="auth-label">Estado
                            <select className="auth-input" value={shipmentUpdateForm.status} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, status: e.target.value })}>
                              {SHIPMENT_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </label>
                          <label className="auth-label">Transportista <input type="text" className="auth-input" placeholder="Ej: FedEx" value={shipmentUpdateForm.carrier} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, carrier: e.target.value })} /></label>
                          <label className="auth-label">Ruta <input type="text" className="auth-input" placeholder="Ej: RT-99" value={shipmentUpdateForm.routeCode} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, routeCode: e.target.value })} /></label>
                          <label className="auth-label">Fecha de Entrega <input type="date" className="auth-input" value={shipmentUpdateForm.estimatedDeliveryDate} onChange={(e) => setShipmentUpdateForm({ ...shipmentUpdateForm, estimatedDeliveryDate: e.target.value })} /></label>
                        </div>
                        <button type="submit" className={`auth-submit-btn mt-20 ${loadingStates.shipUpdate ? "loading" : ""}`} disabled={loadingStates.shipUpdate}>Guardar Cambios</button>
                        <FormAlert status={statusMessages.shipUpdate} />
                      </form>

                      <form onSubmit={handleShipmentDeleteSubmit} className="service-card-form full-width danger" style={{gridColumn: '1 / -1'}}>
                        <h3 className="title-danger">Zona de Peligro</h3>
                        <div className="flex-row-end-gap-15" style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                          <label className="auth-label flex-1 text-danger-light" style={{flex: 1}}>Tracking Code a Eliminar
                            <input type="text" className="auth-input input-danger" required placeholder="TRK-XXX" value={shipmentDeleteForm.trackingCode} onChange={(e) => setShipmentDeleteForm({ ...shipmentDeleteForm, trackingCode: e.target.value })} />
                          </label>
                          <button type="submit" className={`logout-btn btn-danger-large ${loadingStates.shipDelete ? "loading" : ""}`} disabled={loadingStates.shipDelete}>Eliminar Definitivamente</button>
                        </div>
                        <FormAlert status={statusMessages.shipDelete} />
                      </form>

                    </div>
                  </section>
              )}

              {/* 4. GESTIÓN DE USUARIOS (Módulo Restaurado Completo) */}
              {role === "ROLE_ADMIN" && (
                  <section className="inventory-table-section anim-fade-up delay-4">
                    <div className="table-header"><h2 className="title-users">Módulo de Administración de Usuarios</h2></div>
                    {loadingStates.users ? (
                        <div className="loading-text-users" style={{padding: '20px', color: 'white'}}>Sincronizando con Auth...</div>
                    ) : (
                        <div className="users-table-container" style={{overflowX: 'auto'}}>
                          <table className="users-table" style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                            <thead className="users-table-head">
                            <tr>
                              <th className="users-th" style={{padding: '10px', borderBottom: '1px solid #444'}}>Usuario</th>
                              <th className="users-th" style={{padding: '10px', borderBottom: '1px solid #444'}}>Correo</th>
                              <th className="users-th-wide" style={{padding: '10px', borderBottom: '1px solid #444'}}>Rol Asignado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="users-tr">
                                  <td className="users-td" style={{padding: '10px', borderBottom: '1px solid #333', color: 'white'}}>{u.username}</td>
                                  <td className="users-td-muted" style={{padding: '10px', borderBottom: '1px solid #333', color: '#aaa'}}>{u.email}</td>
                                  <td className="users-td" style={{padding: '10px', borderBottom: '1px solid #333'}}>
                                    <select className="auth-input" value={u.role || ""} onChange={(e) => handleRoleChange(u.id, u, e.target.value)}>
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
                    <div style={{marginTop: '15px'}}><FormAlert status={statusMessages.users} /></div>
                  </section>
              )}

            </div>
          </div>
        </main>
      </div>
  );
}

export default ServicesPage;