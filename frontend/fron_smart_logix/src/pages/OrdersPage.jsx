import { Fragment, useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../services/ordersService";
import { getPaymentMethods, processPayment, getPaymentByOrder } from "../services/paymentsService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/formatters";
import { LuFileText, LuInbox, LuChevronDown, LuChevronUp, LuCreditCard, LuCheck, LuX } from "react-icons/lu";
import "../App.css";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cardToken, setCardToken] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentResults, setPaymentResults] = useState({});

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData] = await Promise.all([
          getOrders(),
          new Promise((resolve) => setTimeout(resolve, 1000))
        ]);

        const ordersList = ordersData || [];
        setOrders(ordersList);

        // Cargamos el token de tarjeta del usuario.
        // FIX: usamos { critical: false } para que un 403 en este endpoint no redirija al login.
        // Un usuario con rol ORDERS puede no tener acceso a métodos de pago, y eso es válido.
        try {
          const methods = await getPaymentMethods({ critical: false });
          if (Array.isArray(methods) && methods.length > 0) {
            setCardToken(methods[0].token);
          }
        } catch (paymentErr) {
          // Sin tarjeta registrada o sin permisos — la UI lo maneja mostrando el aviso de "sin tarjeta"
          console.warn("No se pudieron cargar métodos de pago:", paymentErr.message);
        }

        // Verificamos qué órdenes PENDING ya tienen un pago aprobado.
        // FIX: también con { critical: false } para que un 403/404 no rompa la carga de la página.
        const pendingOrders = ordersList.filter(o => o.status === "PENDING");
        const resultsMap = {};

        await Promise.all(
            pendingOrders.map(async (order) => {
              try {
                const payment = await getPaymentByOrder(order.orderNumber, { critical: false });
                if (payment && (payment.status === "COMPLETED" || payment.status === "APPROVED" || payment.status === "SUCCESS")) {
                  resultsMap[order.orderNumber] = "APPROVED";
                }
              } catch (err) {
                // Si no se encuentra pago (404) o no hay permiso (403), es normal — simplemente no está pagada
              }
            })
        );

        setPaymentResults(resultsMap);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleExpandOrder = (orderNumber) => {
    setExpandedOrderId(expandedOrderId === orderNumber ? null : orderNumber);
  };

  async function handlePagar(order) {
    if (!cardToken) {
      alert("No tienes una tarjeta registrada. Ve a tu perfil y agrega un método de pago.");
      return;
    }

    setPayingOrder(order.orderNumber);
    try {
      const payload = {
        orderNumber: String(order.orderNumber || ""),
        customerEmail: String(user.email || user.username || "usuario@smartlogix.com"),
        savedCardToken: String(cardToken || ""),
        amount: Number(order.totalAmount || 0),
        currency: "USD"
      };

      console.log("Enviando pago con el siguiente payload:", payload);

      const result = await processPayment(payload);

      try {
        await updateOrderStatus(order.orderNumber, { status: "APPROVED" });
        console.log(`Orden ${order.orderNumber} actualizada a APPROVED`);
      } catch (orderErr) {
        console.error("El pago se cobró, pero hubo un desfase al actualizar el estado de la orden:", orderErr);
      }

      setPaymentResults((prev) => ({
        ...prev,
        [order.orderNumber]: result.status || "APPROVED",
      }));

      const updated = await getOrders();
      setOrders(updated || []);
    } catch (err) {
      if (err.message?.includes("400") || err.message?.includes("Conflict")) {
        setPaymentResults((prev) => ({
          ...prev,
          [order.orderNumber]: "APPROVED",
        }));
      } else {
        setPaymentResults((prev) => ({
          ...prev,
          [order.orderNumber]: "ERROR",
        }));
      }
      console.error("Error procesando pago:", err);
    } finally {
      setPayingOrder(null);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Recuperando Registro de Órdenes..." />;
  }

  const totalMontoCalculado = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendientes = orders.filter((o) => o.status === "PENDING" && !paymentResults[o.orderNumber]).length;

  return (
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <div className="inventory-container anim-fade-up">

            <header className="inventory-header">
              <h1>Gestión de Órdenes</h1>
              <p>Administración y seguimiento de pedidos de clientes.</p>
            </header>

            <section className="inventory-stats">
              <div className="stat-card anim-scale-in delay-1">
                <div className="stat-card-content">
                  <h3>Total Órdenes</h3>
                  <p>{orders.length}</p>
                </div>
              </div>
              <div className={`stat-card anim-scale-in delay-2 ${pendientes > 0 ? "purple-border stat-pulse-glow" : ""}`}>
                <div className="stat-card-content">
                  <h3>Pendientes</h3>
                  <p className={pendientes > 0 ? "stat-text-blue" : ""}>{pendientes}</p>
                </div>
              </div>
              <div className="stat-card green-border anim-scale-in delay-3">
                <div className="stat-card-content">
                  <h3>Ingreso Global</h3>
                  <p className="stat-text-green stat-text-lg">{formatCurrency(totalMontoCalculado)}</p>
                </div>
              </div>
            </section>

            {!cardToken && (
                <div className="auth-alert error" style={{ marginBottom: "16px" }}>
                  No tienes una tarjeta registrada. Para pagar órdenes, ve a tu perfil y agrega un método de pago.
                </div>
            )}

            <section className="inventory-table-section anim-fade-up delay-3">
              <div className="table-header">
                <h2>Flujo de Pedidos</h2>
              </div>
              <div className="table-scroll-wrapper">
                <table className="inventory-table">
                  <thead>
                  <tr>
                    <th className="col-expand"></th>
                    <th>ID Orden</th>
                    <th>Estado</th>
                    <th>Tracking</th>
                    <th>Detalle</th>
                    <th>Creación</th>
                    <th>Total</th>
                    <th>Pago</th>
                  </tr>
                  </thead>
                  <tbody>
                  {orders.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-state-cell">
                          <LuInbox className="empty-state-icon" />
                          <p className="empty-state-title">Bandeja de entrada vacía</p>
                          <p className="empty-state-desc">No se han generado órdenes de compra aún.</p>
                        </td>
                      </tr>
                  ) : (
                      orders.map((order, index) => {
                        let statusClass = "status-unknown";
                        if (order.status === "PENDING") statusClass = "status-preparing";
                        if (order.status === "COMPLETED" || order.status === "APPROVED") statusClass = "status-delivered";
                        if (order.status === "CANCELLED") statusClass = "status-cancelled";

                        const isExpanded = expandedOrderId === order.orderNumber;
                        const isPaying = payingOrder === order.orderNumber;
                        const paymentResult = paymentResults[order.orderNumber];

                        const estaPagado =
                            paymentResult === "COMPLETED" ||
                            paymentResult === "APPROVED" ||
                            order.status === "COMPLETED" ||
                            order.status === "APPROVED";

                        const estaFallido = paymentResult === "FAILED" || paymentResult === "ERROR";

                        return (
                            <Fragment key={order.orderNumber}>
                              <tr className="anim-fade-up clickable-row" style={{ animationDelay: `${0.3 + (index * 0.03)}s` }}
                                  onClick={() => toggleExpandOrder(order.orderNumber)}>
                                <td className="col-expand">
                                  {isExpanded ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
                                </td>
                                <td><span className="sku">{order.orderNumber}</span></td>
                                <td>
                                  <span className={`status ${statusClass}`}>
                                    {estaPagado && order.status === "PENDING" ? "APPROVED" : order.status}
                                  </span>
                                </td>
                                <td className="order-link-cell">
                                  {order.trackingCode ? order.trackingCode : <span className="badge-muted">Por asignar</span>}
                                </td>
                                <td>
                                  {order.lines && order.lines.length > 0 ? (
                                      <div className="text-light details-summary">
                                        <LuFileText className="details-icon" />
                                        {order.lines.length} items
                                      </div>
                                  ) : (
                                      <span className="badge-muted">Sin detalles</span>
                                  )}
                                </td>
                                <td className="date-cell">{formatDate(order.createdAt)}</td>
                                <td className="font-bold text-success total-amount-cell">
                                  {formatCurrency(order.totalAmount || 0)}
                                  {order.discountAmount > 0 && (
                                      <div className="text-success" style={{ fontSize: "11px" }}>
                                        {order.discountReason} (-{formatCurrency(order.discountAmount)})
                                      </div>
                                  )}
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  {estaPagado ? (
                                      <span className="text-success" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600" }}>
                                        <LuCheck size={16} /> Pagado
                                      </span>
                                  ) : estaFallido ? (
                                      <span className="text-danger" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600" }}>
                                        <LuX size={16} /> Fallido
                                      </span>
                                  ) : order.status === "PENDING" && cardToken ? (
                                      <button
                                          className="pay-btn"
                                          onClick={() => handlePagar(order)}
                                          disabled={isPaying}>
                                        <LuCreditCard size={14} />
                                        {isPaying ? "Procesando..." : "Pagar"}
                                      </button>
                                  ) : (
                                      <span className="badge-muted">—</span>
                                  )}
                                </td>
                              </tr>

                              {isExpanded && (
                                  <tr className="expanded-row">
                                    <td className="expanded-cell" colSpan="8">
                                      <div className="expanded-content-wrapper">
                                        <h4 className="expanded-title">Ítems de la Orden</h4>

                                        {order.lines && order.lines.length > 0 ? (
                                            <table className="details-table">
                                              <thead>
                                              <tr className="details-table-head">
                                                <th className="details-th-left">SKU</th>
                                                <th className="details-th-center">Cantidad</th>
                                                <th className="details-th-right">Precio Unit.</th>
                                                <th className="details-th-right">Subtotal</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              {order.lines.map((line, i) => (
                                                  <tr key={`${order.orderNumber}-line-${i}`} className="details-tr-body">
                                                    <td className="details-td-sku">{line.sku}</td>
                                                    <td className="details-td-qty">{line.quantity}</td>
                                                    <td className="details-td-price">{formatCurrency(line.unitPrice)}</td>
                                                    <td className="details-td-subtotal">{formatCurrency(line.lineAmount)}</td>
                                                  </tr>
                                              ))}
                                              </tbody>
                                            </table>
                                        ) : (
                                            <p className="details-empty">Esta orden no tiene ítems registrados.</p>
                                        )}

                                        {order.reason && (
                                            <p className="text-danger" style={{ marginTop: "12px", fontSize: "13px" }}>
                                              Motivo: {order.reason}
                                            </p>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                              )}
                            </Fragment>
                        );
                      })
                  )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
  );
}

export default OrdersPage;