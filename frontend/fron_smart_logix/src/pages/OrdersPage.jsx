import { useEffect, useState } from "react";
import { getOrders } from "../services/ordersService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/formatters";
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
    return <LoadingSpinner message="Cargando órdenes de compra..." />;
  }

  const totalMontoCalculado = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="inventory-container">
      <Navbar />

      <section className="inventory-stats">
        <div className="stat-card">
          <h3>Total Órdenes</h3>
          <p>{orders.length}</p>
        </div>
        <div className="stat-card blue-border">
          <h3>Órdenes Pendientes</h3>
          <p className="stat-text-blue">
            {orders.filter((o) => o.status === "PENDING").length}
          </p>
        </div>
        <div className="stat-card green-border">
          <h3>Monto Global Generado</h3>
          <p className="stat-text-green">{formatCurrency(totalMontoCalculado)}</p>
        </div>
      </section>

      <section className="inventory-table-section">
        <div className="table-header">
          <h2>Registro de Órdenes</h2>
        </div>
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Estado</th>
                <th>Código Tracking</th>
                <th>Detalle de Productos</th>
                <th>Fecha de Creación</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                let statusClass = "status-unknown";
                if (order.status === "PENDING") statusClass = "status-preparing";
                if (order.status === "COMPLETED") statusClass = "status-delivered";
                if (order.status === "CANCELLED") statusClass = "status-cancelled";

                return (
                  <tr key={order.orderNumber}>
                    <td className="sku">{order.orderNumber}</td>
                    
                    <td>
                      <span className={`status ${statusClass}`}>
                        {order.status}
                      </span>
                    </td>

                    <td>
                      {order.trackingCode ? order.trackingCode : <span className="text-muted">Sin asignar</span>}
                    </td>

                    <td>
                      {order.lines && order.lines.length > 0 ? (
                        <ul className="order-lines-list">
                          {order.lines.map((line, i) => (
                            <li key={i}>
                              {line.quantity}x <strong>{line.sku}</strong> 
                              <span className="order-line-price">
                                ({formatCurrency(line.unitPrice)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">Sin detalles</span>
                      )}
                    </td>

                    <td className="date-cell">{formatDate(order.createdAt)}</td>

                    <td className="font-bold text-success">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default OrdersPage;