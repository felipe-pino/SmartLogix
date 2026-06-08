import { useEffect, useState } from "react";
import { getShipments } from "../services/shipmentsService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatters";
import { LuTruck, LuMapPin } from "react-icons/lu";
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
    return <LoadingSpinner message="Rastreando Unidades Logísticas..." />;
  }

  const enviosEnTransito = shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "SHIPPED").length;
  const enviosEntregados = shipments.filter(s => s.status === "DELIVERED").length;

  return (
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <div className="inventory-container anim-fade-up">

            <header className="inventory-header">
              <h1>Seguimiento de Envíos</h1>
              <p>Control y trazabilidad de la red de distribución.</p>
            </header>

            <section className="inventory-stats">
              <div className="stat-card anim-scale-in delay-1">
                <div className="stat-card-content">
                  <h3>Total Envíos</h3>
                  <p>{shipments.length}</p>
                </div>
              </div>

              <div className={`stat-card anim-scale-in delay-2 ${enviosEnTransito > 0 ? "blue-border" : ""}`}>
                <div className="stat-card-content">
                  <h3>En Ruta</h3>
                  <p className={enviosEnTransito > 0 ? "stat-text-blue" : ""}>{enviosEnTransito}</p>
                </div>
              </div>

              <div className="stat-card green-border anim-scale-in delay-3">
                <div className="stat-card-content">
                  <h3>Entregados</h3>
                  <p className="stat-text-green">{enviosEntregados}</p>
                </div>
              </div>
            </section>

            <section className="inventory-table-section anim-fade-up delay-3">
              <div className="table-header">
                <h2>Monitor Logístico</h2>
              </div>
              <div className="table-scroll-wrapper">
                <table className="inventory-table">
                  <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Orden</th>
                    <th>Transportista</th>
                    <th>Ruta</th>
                    <th>Estado</th>
                    <th>Creación</th>
                    <th>Entrega Estimada</th>
                  </tr>
                  </thead>
                  <tbody>
                  {shipments.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                          <LuTruck style={{ fontSize: "40px", marginBottom: "15px", color: "#334155" }} />
                          <p style={{fontWeight: 600, fontSize: '16px'}}>Red logística inactiva</p>
                          <p style={{fontSize: '14px'}}>No se registran movimientos de mercancía.</p>
                        </td>
                      </tr>
                  ) : (
                      shipments.map((shipment, index) => {

                        let statusClass = "status-unknown";
                        const status = shipment.status || "DESCONOCIDO";

                        if (status === "DELIVERED") statusClass = "status-delivered";
                        else if (status === "IN_TRANSIT" || status === "SHIPPED") statusClass = "status-transit";
                        else if (status === "PREPARING" || status === "PLANNED") statusClass = "status-preparing";
                        else if (status === "CANCELLED") statusClass = "status-cancelled";

                        return (
                            <tr key={shipment.trackingCode || index} className="anim-fade-up" style={{animationDelay: `${0.3 + (index * 0.03)}s`}}>
                              <td><span className="sku">{shipment.trackingCode}</span></td>

                              <td className="order-link-cell">
                                {shipment.orderNumber || <span className="badge-muted">Sin Orden</span>}
                              </td>

                              <td>
                                {shipment.carrier ? (
                                    <span className="carrier-cell text-light">
                                <LuTruck style={{color: '#38bdf8'}}/>
                                      {shipment.carrier}
                              </span>
                                ) : (
                                    <span className="badge-muted">No asignado</span>
                                )}
                              </td>

                              <td>
                                {shipment.routeCode ? (
                                    <span className="text-light" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                 <LuMapPin style={{color: '#a78bfa'}}/>
                                      {shipment.routeCode}
                               </span>
                                ) : (
                                    <span className="badge-muted">---</span>
                                )}
                              </td>

                              <td>
                            <span className={`status ${statusClass}`}>
                              {status}
                            </span>
                              </td>

                              <td className="date-cell">
                                {shipment.createdAt ? formatDate(shipment.createdAt) : <span className="badge-muted">---</span>}
                              </td>

                              <td className="delivery-cell">
                                {shipment.estimatedDeliveryDate ? formatDate(shipment.estimatedDeliveryDate) : (
                                    <span className="badge-muted">Por definir</span>
                                )}
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

export default ShipmentsPage;