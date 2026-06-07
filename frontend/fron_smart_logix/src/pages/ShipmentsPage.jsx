import { useEffect, useState } from "react";
import { getShipments } from "../services/shipmentsService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatters";
import "../App.css";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShipments() {
      try {
        const [data] = await Promise.all([
          getShipments(),
          new Promise((resolve) => setTimeout(resolve, 1000))
        ]);
        setShipments(data || []);
      } catch (error) {
        console.error("Error en la petición:", error);
      } finally {
        setLoading(false);
      }
    }
    loadShipments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Analizando estructura de envíos..." />;
  }

  const enviosEnTransito = shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "SHIPPED").length;
  const enviosEntregados = shipments.filter(s => s.status === "DELIVERED").length;

  return (
    <div className="inventory-container">
      <Navbar />

      {/* Tarjetas de Estadísticas Logísticas */}
      <section className="inventory-stats" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <h3>Total de Envíos</h3>
          <p>{shipments.length}</p>
        </div>
        
        <div className={`stat-card ${enviosEnTransito > 0 ? "blue-border" : ""}`}>
          <h3>En Tránsito / Ruta</h3>
          <p className={enviosEnTransito > 0 ? "stat-text-blue" : ""}>{enviosEnTransito}</p>
        </div>
        
        <div className="stat-card green-border">
          <h3>Entregados con Éxito</h3>
          <p className="stat-text-green">{enviosEntregados}</p>
        </div>
      </section>

      <section className="inventory-table-section">
        <div className="table-header">
          <h2>Seguimiento de Envíos</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código Tracking</th>
                <th>Orden Asociada</th>
                <th>Transportista</th>
                <th>Ruta (Route Code)</th>
                <th>Estado Logístico</th>
                <th>Fecha de Creación</th>
                <th>Entrega Estimada</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment, index) => {
                
                // Determinación de la clase CSS del estado
                let statusClass = "status-unknown";
                const status = shipment.status || "DESCONOCIDO";

                if (status === "DELIVERED") {
                  statusClass = "status-delivered";
                } else if (status === "IN_TRANSIT" || status === "SHIPPED") {
                  statusClass = "status-transit";
                } else if (status === "PREPARING" || status === "PLANNED") {
                  statusClass = "status-preparing";
                } else if (status === "CANCELLED") {
                  statusClass = "status-cancelled";
                }

                return (
                  <tr key={shipment.trackingCode || index}>
                    {/* TRACKING */}
                    <td className="sku">
                      <strong>{shipment.trackingCode}</strong>
                    </td>

                    {/* NÚMERO DE ORDEN */}
                    <td className="order-link-cell">
                      {shipment.orderNumber || "Sin Orden"}
                    </td>

                    {/* TRANSPORTISTA */}
                    <td>
                      {shipment.carrier ? (
                        <span className="carrier-cell">
                          {shipment.carrier}
                        </span>
                      ) : (
                        <span className="text-muted">No asignado</span>
                      )}
                    </td>

                    {/* CÓDIGO DE RUTA */}
                    <td className="text-light">
                      {shipment.routeCode || "---"}
                    </td>

                    {/* ESTADO */}
                    <td>
                      <span className={`status ${statusClass}`}>
                        {status}
                      </span>
                    </td>

                    {/* FECHA DE CREACIÓN */}
                    <td className="date-cell">
                      {shipment.createdAt ? formatDate(shipment.createdAt) : "---"}
                    </td>

                    {/* FECHA ESTIMADA DE ENTREGA */}
                    <td className="delivery-cell">
                      {shipment.estimatedDeliveryDate ? formatDate(shipment.estimatedDeliveryDate) : (
                        <span className="text-muted" style={{ fontWeight: "normal" }}>Por definir</span>
                      )}
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

export default ShipmentsPage;