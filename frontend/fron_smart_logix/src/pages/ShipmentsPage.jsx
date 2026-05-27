import { useEffect, useState } from "react";
import { getShipments } from "../services/shipmentsService";
import Navbar from "../components/Navbar";
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
        
        // ========================================================
        // COMANDO 1: Esto imprimirá los datos exactos en tu F12
        // ========================================================
        console.log("=== DATOS EXTRAÍDOS DE TU SPRING BOOT ===");
        console.log(data);
        console.log("=========================================");

        setShipments(data);
      } catch (error) {
        console.error("Error en la petición:", error);
      } finally {
        setLoading(false);
      }
    }
    loadShipments();
  }, []);

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="spinner"></div>
        <h2>Analizando estructura de envíos...</h2>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <Navbar />

      <section className="inventory-stats" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <h3>Despachos en Arreglo (Length)</h3>
          <p>{shipments ? shipments.length : 0}</p>
        </div>
      </section>

      {/* RECUADRO DE DIAGNÓSTICO VISUAL */}
      <section className="inventory-table-section" style={{ marginBottom: "20px", borderColor: "#f59e0b" }}>
        <h3 style={{ color: "#f59e0b", marginBottom: "10px" }}>Análisis del JSON del Backend:</h3>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "15px" }}>
          Si ves texto aquí abajo, cópialo y pégamelo en el chat para decirte cómo solucionar la tabla vacía:
        </p>
        <pre style={{ 
          background: "#0f172a", 
          padding: "15px", 
          borderRadius: "8px", 
          overflowX: "auto",
          color: "#4ade80",
          fontFamily: "monospace",
          fontSize: "13px",
          border: "1px solid #334155"
        }}>
          {JSON.stringify(shipments, null, 2)}
        </pre>
      </section>

      <section className="inventory-table-section">
        <div className="table-header">
          <h2>Seguimiento de Envíos</h2>
        </div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Código Tracking</th>
              <th>Transportista</th>
              <th>Dirección</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {shipments && shipments.map((shipment, index) => (
              <tr key={shipment.id || index}>
                <td className="sku">{shipment.trackingNumber || String(shipment.id || index)}</td>
                <td>{shipment.carrier || "Revisando..."}</td>
                <td>{shipment.destinationAddress || "Revisando..."}</td>
                <td>{shipment.status || "Revisando..."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ShipmentsPage;