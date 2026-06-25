import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NavbarCliente from "../components/NavbarCliente";
import {
  LuCreditCard, LuCirclePlus, LuTrash2, LuShieldCheck,
  LuUser, LuPackagePlus, LuX, LuPlus, LuSend,
} from "react-icons/lu";
import { getPaymentMethods, deletePaymentMethod } from "../services/paymentsService";
import { createOrder } from "../services/ordersService";
import { getInventory } from "../services/inventoryService";
import "../App.css";

/* ── Utilidad: avatar con iniciales ── */
function UserAvatar({ username }) {
  const initials = (username || "?")
      .split(/[\s_-]/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

  return (
      <div className="profile-avatar">
        <span className="profile-avatar-initials">{initials}</span>
        <span className="profile-avatar-ring" />
      </div>
  );
}

/* ── Formulario de nueva orden ── */
function CreateOrderForm({ onSuccess, onCancel }) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  const [customerName, setCustomerName]       = useState(user.username || "");
  const [customerEmail, setCustomerEmail]     = useState(user.email || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [lines, setLines]                     = useState([{ sku: "", quantity: 1, unitPrice: "" }]);
  const [inventory, setInventory]             = useState([]);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState("");

  useEffect(() => {
    getInventory()
        .then((data) => setInventory(data || []))
        .catch(() => {});
  }, []);

  const addLine = () =>
      setLines((prev) => [...prev, { sku: "", quantity: 1, unitPrice: "" }]);

  const removeLine = (i) =>
      setLines((prev) => prev.filter((_, idx) => idx !== i));

  const updateLine = (i, field, value) =>
      setLines((prev) =>
          prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l))
      );

  const handleSkuChange = (i, sku) => {
    const item = inventory.find((inv) => inv.sku === sku);
    updateLine(i, "sku", sku);
    if (item?.unitPrice !== undefined) updateLine(i, "unitPrice", item.unitPrice);
  };

  const total = lines.reduce(
      (acc, l) => acc + (Number(l.unitPrice) || 0) * (Number(l.quantity) || 0),
      0
  );

  async function handleSubmit() {
    setError("");
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      setError("Nombre, email y dirección son obligatorios.");
      return;
    }
    if (lines.some((l) => !l.sku || !l.quantity || !l.unitPrice)) {
      setError("Completa todos los campos de cada línea de producto.");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        lines: lines.map((l) => ({
          sku: l.sku.trim().toUpperCase(),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al crear la orden.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className="create-order-form">
        <div className="create-order-header">
          <LuPackagePlus size={22} style={{ color: "var(--color-primary)" }} />
          <h3>Nueva Orden de Compra</h3>
        </div>

        {/* Datos del cliente */}
        <div className="create-order-grid">
          <label className="auth-label">
            Nombre del Cliente
            <input
                className="auth-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej: Juan Pérez"
            />
          </label>
          <label className="auth-label">
            Correo Electrónico
            <input
                className="auth-input"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
            />
          </label>
        </div>

        <label className="auth-label" style={{ display: "block", marginBottom: "20px" }}>
          Dirección de Envío
          <input
              className="auth-input"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Calle 123, Ciudad, País"
          />
        </label>

        {/* Líneas de productos */}
        <div className="create-order-lines-header">
          <span>Líneas de Producto</span>
          <button className="create-order-add-btn" onClick={addLine} type="button">
            <LuPlus size={14} /> Agregar línea
          </button>
        </div>

        <div className="create-order-lines">
          {lines.map((line, i) => (
              <div key={i} className="create-order-line">
                {/* SKU con datalist del inventario */}
                <label className="auth-label" style={{ flex: 2 }}>
                  SKU
                  <input
                      className="auth-input"
                      list={`sku-list-${i}`}
                      value={line.sku}
                      onChange={(e) => handleSkuChange(i, e.target.value)}
                      placeholder="Ej: SKU-001"
                  />
                  <datalist id={`sku-list-${i}`}>
                    {inventory.map((inv) => (
                        <option key={inv.sku} value={inv.sku}>
                          {inv.productName}
                        </option>
                    ))}
                  </datalist>
                </label>

                <label className="auth-label" style={{ flex: 1 }}>
                  Cantidad
                  <input
                      className="auth-input"
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  />
                </label>

                <label className="auth-label" style={{ flex: 1 }}>
                  Precio Unitario
                  <input
                      className="auth-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                      placeholder="0.00"
                  />
                </label>

                {lines.length > 1 && (
                    <button
                        className="create-order-remove-btn"
                        onClick={() => removeLine(i)}
                        type="button"
                        title="Eliminar línea"
                    >
                      <LuX size={16} />
                    </button>
                )}
              </div>
          ))}
        </div>

        {/* Total calculado */}
        <div className="create-order-total">
          <span>Total estimado</span>
          <strong>${total.toFixed(2)}</strong>
        </div>

        {error && (
            <div className="auth-alert error" style={{ marginBottom: "12px" }}>
              {error}
            </div>
        )}

        <div className="create-order-actions">
          <button className="auth-submit-btn" onClick={handleSubmit} disabled={submitting} type="button">
            <LuSend size={16} style={{ marginRight: "8px" }} />
            {submitting ? "Enviando..." : "Crear Orden"}
          </button>
          <button
              className="auth-submit-btn"
              onClick={onCancel}
              type="button"
              style={{ background: "rgba(148,163,184,0.1)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
  );
}

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL — ProfilePage
   ══════════════════════════════════════ */
function ProfilePage() {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString
      ? JSON.parse(userString)
      : { username: "Desconocido", role: "Sin Rol" };

  const isCliente = user.role === "ROLE_USER" || user.role === "ROLE_CLIENT";

  const [card, setCard]               = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess]   = useState(false);

  useEffect(() => {
    async function loadCard() {
      try {
        const methods = await getPaymentMethods({ critical: false });
        if (Array.isArray(methods) && methods.length > 0) setCard(methods[0]);
      } catch (err) {
        console.error("Error cargando método de pago:", err);
      } finally {
        setLoadingCard(false);
      }
    }
    loadCard();
  }, []);

  async function handleDeleteCard() {
    if (!card) return;
    try {
      await deletePaymentMethod(card.id);
      setCard(null);
    } catch (err) {
      console.error("Error eliminando tarjeta:", err);
    }
  }

  function handleOrderSuccess() {
    setShowOrderForm(false);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 4000);
  }

  /* Rol con badge de color */
  const roleBadgeColor =
      user.role?.includes("ADMIN")   ? "#a855f7" :
          user.role?.includes("ORDERS")  ? "#38bdf8" :
              user.role?.includes("USER")    ? "#22c55e" : "#94a3b8";

  return (
      <div className="app-layout">
        {isCliente ? <NavbarCliente /> : <Navbar />}

        <main className="main-content">
          <div className="inventory-container anim-fade-up">

            {/* ── Header de perfil ── */}
            <div className="profile-hero">
              <UserAvatar username={user.username} />
              <div className="profile-hero-info">
                <h1 className="profile-hero-name">{user.username}</h1>
                <span
                    className="profile-role-badge"
                    style={{ background: `${roleBadgeColor}20`, color: roleBadgeColor, borderColor: `${roleBadgeColor}50` }}
                >
                {user.role || "Sin Rol"}
              </span>
              </div>
            </div>

            <div className="profile-grid">

              {/* ── Columna izquierda: datos de cuenta ── */}
              <div className="profile-col">

                <div className="profile-section-card">
                  <div className="profile-section-title">
                    <LuUser size={18} style={{ color: "var(--color-primary)" }} />
                    <h2>Información de Cuenta</h2>
                  </div>

                  <div className="profile-field">
                    <label className="auth-label">Nombre de Usuario</label>
                    <input type="text" className="auth-input" value={user.username} disabled />
                  </div>

                  <div className="profile-field">
                    <label className="auth-label">Rol en el Sistema</label>
                    <input
                        type="text"
                        className="auth-input text-highlight"
                        value={user.role}
                        disabled
                        style={{ color: roleBadgeColor }}
                    />
                  </div>

                  <button
                      className="auth-submit-btn"
                      onClick={() => navigate(isCliente ? "/store" : "/dashboard")}
                      style={{ marginTop: "8px" }}
                  >
                    {isCliente ? "Ir a la Tienda" : "Ir al Dashboard"}
                  </button>
                </div>

                {/* ── Tarjeta de pago ── */}
                <div className="profile-section-card">
                  <div className="profile-section-title">
                    <LuCreditCard size={18} style={{ color: "var(--color-primary)" }} />
                    <h2>Método de Pago</h2>
                  </div>

                  {loadingCard ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Cargando tarjeta...</p>
                  ) : card ? (
                      <>
                        <div className="profile-card-preview">
                          <LuShieldCheck size={26} style={{ color: "#22c55e", flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 700, color: "var(--text-h)", margin: 0 }}>
                              {card.brand} •••• {card.lastFourDigits}
                            </p>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                              {card.cardHolder} — Vence {card.expiryDate}
                            </p>
                          </div>
                        </div>

                        <div className="profile-field">
                          <label className="auth-label">Token generado</label>
                          <input
                              type="text"
                              className="auth-input"
                              value={card.token}
                              disabled
                              style={{ fontSize: "12px", letterSpacing: "0.5px" }}
                          />
                        </div>

                        <button
                            className="auth-submit-btn"
                            onClick={handleDeleteCard}
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", marginTop: "8px" }}
                        >
                          <LuTrash2 style={{ marginRight: "8px" }} />
                          Eliminar Tarjeta
                        </button>
                      </>
                  ) : (
                      <>
                        <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "14px" }}>
                          No tienes un método de pago registrado aún.
                        </p>
                        <button className="auth-submit-btn" onClick={() => navigate("/payment-method")}>
                          <LuCirclePlus style={{ marginRight: "8px" }} />
                          Agregar Tarjeta
                        </button>
                      </>
                  )}
                </div>
              </div>

              {/* ── Columna derecha: nueva orden ── */}
              <div className="profile-col">
                <div className="profile-section-card">
                  <div className="profile-section-title">
                    <LuPackagePlus size={18} style={{ color: "var(--color-primary)" }} />
                    <h2>Crear Orden de Compra</h2>
                  </div>

                  {orderSuccess && (
                      <div className="auth-alert success" style={{ marginBottom: "16px" }}>
                        ¡Orden creada exitosamente! Puedes verla en el panel de Órdenes.
                      </div>
                  )}

                  {showOrderForm ? (
                      <CreateOrderForm
                          onSuccess={handleOrderSuccess}
                          onCancel={() => setShowOrderForm(false)}
                      />
                  ) : (
                      <div className="profile-order-placeholder">
                        <LuPackagePlus size={40} style={{ color: "rgba(56,189,248,0.2)", marginBottom: "14px" }} />
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
                          Registra una nueva orden de compra con los datos del cliente y los productos a despachar.
                        </p>
                        <button className="auth-submit-btn" onClick={() => setShowOrderForm(true)}>
                          <LuPackagePlus style={{ marginRight: "8px" }} />
                          Nueva Orden
                        </button>
                      </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
  );
}

export default ProfilePage;