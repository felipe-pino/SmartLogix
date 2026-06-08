import { useEffect, useState } from "react";
import { getOrders } from "../services/ordersService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/formatters";
import { LuFileText, LuInbox } from "react-icons/lu";
import "../App.css";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <div className={`stat-card anim-scale-in delay-2 ${pendientes > 0 ? "purple-border" : ""}`} style={pendientes > 0 ? {animation: 'pulseGlow 2s infinite', animationDelay: '1s'} : {}}>
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
                  <p className="stat-text-green" style={{fontSize: '36px'}}>{formatCurrency(totalMontoCalculado)}</p>
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
                        <td colSpan="6" style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                          <LuInbox style={{ fontSize: "40px", marginBottom: "15px", color: "#334155" }} />
                          <p style={{fontWeight: 600, fontSize: '16px'}}>Bandeja de entrada vacía</p>
                          <p style={{fontSize: '14px'}}>No se han generado órdenes de compra aún.</p>
                        </td>
                      </tr>
                  ) : (
                      orders.map((order, index) => {
                        let statusClass = "status-unknown";
                        if (order.status === "PENDING") statusClass = "status-preparing";
                        if (order.status === "COMPLETED") statusClass = "status-delivered";
                        if (order.status === "CANCELLED") statusClass = "status-cancelled";

                        return (
                            <tr key={order.orderNumber} className="anim-fade-up" style={{animationDelay: `${0.3 + (index * 0.03)}s`}}>
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
                                    <div className="text-light" style={{fontSize: '13px'}}>
                                      <LuFileText style={{marginRight: '5px', color: '#a78bfa'}}/>
                                      {order.lines.length} items registrados
                                    </div>
                                ) : (
                                    <span className="badge-muted">Sin detalles</span>
                                )}
                              </td>

                              <td className="date-cell">{formatDate(order.createdAt)}</td>

                              <td className="font-bold text-success" style={{fontSize: '16px'}}>
                                {formatCurrency(order.totalAmount || 0)}
                              </td>

                            </tr>
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