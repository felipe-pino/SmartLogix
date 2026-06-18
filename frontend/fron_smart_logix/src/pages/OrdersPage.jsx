import { Fragment, useEffect, useState } from "react";
import { getOrders } from "../services/ordersService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/formatters";
import { LuFileText, LuInbox, LuChevronDown, LuChevronUp } from "react-icons/lu";
import "../App.css";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Estado para expandir fila

  useEffect(() => {
    async function loadOrders() {
      try {
        const [data] = await Promise.all([
          getOrders(),
          new Promise((resolve) => setTimeout(resolve, 1000))
        ]);
        setOrders(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const toggleExpandOrder = (orderNumber) => {
    if (expandedOrderId === orderNumber) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderNumber);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Recuperando Registro de Órdenes..." />;
  }

  const totalMontoCalculado = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendientes = orders.filter((o) => o.status === "PENDING").length;

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
                  <p className={pendientes > 0 ? "stat-text-blue" : ""}>
                    {pendientes}
                  </p>
                </div>
              </div>
              <div className="stat-card green-border anim-scale-in delay-3">
                <div className="stat-card-content">
                  <h3>Ingreso Global</h3>
                  <p className="stat-text-green stat-text-lg">{formatCurrency(totalMontoCalculado)}</p>
                </div>
              </div>
            </section>

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
                  </tr>
                  </thead>
                  <tbody>
                  {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state-cell">
                          <LuInbox className="empty-state-icon" />
                          <p className="empty-state-title">Bandeja de entrada vacía</p>
                          <p className="empty-state-desc">No se han generado órdenes de compra aún.</p>
                        </td>
                      </tr>
                  ) : (
                      orders.map((order, index) => {
                        let statusClass = "status-unknown";
                        if (order.status === "PENDING") statusClass = "status-preparing";
                        if (order.status === "COMPLETED") statusClass = "status-delivered";
                        if (order.status === "CANCELLED") statusClass = "status-cancelled";

                        const isExpanded = expandedOrderId === order.orderNumber;

                        return (
                            <Fragment key={order.orderNumber}>
                              <tr
                                  className="anim-fade-up clickable-row"
                                  style={{ animationDelay: `${0.3 + (index * 0.03)}s` }}
                                  onClick={() => toggleExpandOrder(order.orderNumber)}
                              >
                                <td className="col-expand">
                                  {isExpanded ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
                                </td>

                                <td><span className="sku">{order.orderNumber}</span></td>

                                <td>
                                  <span className={`status ${statusClass}`}>
                                    {order.status}
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
                                </td>
                              </tr>

                              {/* Fila colapsable para ver el desglose del Backend */}
                              {isExpanded && (
                                  <tr className="expanded-row">
                                    <td colSpan="7" className="expanded-cell">
                                      <div className="expanded-content-wrapper">
                                        <h4 className="expanded-title">
                                          Desglose de Líneas (Precios Dinámicos)
                                        </h4>
                                        {order.lines && order.lines.length > 0 ? (
                                            <table className="details-table">
                                              <thead>
                                              <tr className="details-table-head">
                                                <th className="details-th-left">SKU</th>
                                                <th className="details-th-center">Cantidad</th>
                                                <th className="details-th-right">Precio Unit. Cobrado</th>
                                                <th className="details-th-discount">Descuento</th>
                                                <th className="details-th-right">Subtotal</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              {order.lines.map((line, idx) => {
                                                // LÓGICA EN CALIENTE PARA VERIFICAR SI SE APLICÓ LA ESTOCADA (Precio base original era $200)
                                                const tieneDescuento = line.sku === "SKU-1001" && line.unitPrice < 200;

                                                return (
                                                    <tr key={idx} className="details-tr-body">
                                                      <td className="details-td-sku">{line.sku}</td>
                                                      <td className="details-td-qty">{line.quantity}</td>
                                                      <td className="details-td-price">
                                                        {formatCurrency(line.unitPrice)}
                                                      </td>
                                                      <td className="details-td-center">
                                                        {tieneDescuento ? (
                                                            <span className="badge-discount">
                                                                -20% Estocada
                                                              </span>
                                                        ) : (
                                                            <span className="no-discount">—</span>
                                                        )}
                                                      </td>
                                                      <td className="details-td-subtotal">
                                                        {formatCurrency(line.unitPrice * line.quantity)}
                                                      </td>
                                                    </tr>
                                                );
                                              })}
                                              </tbody>
                                            </table>
                                        ) : (
                                            <p className="details-empty">No hay líneas registradas.</p>
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