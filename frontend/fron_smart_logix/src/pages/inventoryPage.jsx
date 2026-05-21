import React, { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Evita fugas de memoria si el componente se desmonta

    async function loadInventory() {
      try {
        setLoading(true);
        const data = await getInventory();
        
        if (isMounted) {
          // Nos aseguramos de que lo que guardamos sea siempre un arreglo
          const cleanData = Array.isArray(data) ? data : (data?.content || []);
          setItems(cleanData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── CONTROL DE RENDERIZADO SEGURO ───
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>🔄 Cargando inventario de SmartLogix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", margin: "10px", backgroundColor: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "4px" }}>
        <p style={{ color: "#cc0000", margin: 0 }}><strong>⚠️ Error de Conexión:</strong> {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        📦 Control de Inventario
      </h2>
      
      {items.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>No se encontraron productos disponibles en las bodegas.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }} border="1" cellPadding="12">
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th>SKU</th>
              <th>Nombre del Producto</th>
              <th>Código de Bodega</th>
              <th>Cantidad Disponible</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.sku || item.id || index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fdfdfd" }}>
                <td style={{ fontFamily: "monospace", fontWeight: "bold", color: "#0056b3" }}>
                  {item.sku}
                </td>
                <td>{item.productName || "Sin nombre"}</td>
                <td>{item.warehouseCode || "N/A"}</td>
                <td style={{ fontWeight: item.availableQuantity > 0 ? "normal" : "bold", color: item.availableQuantity > 0 ? "#000" : "#d9534f" }}>
                  {item.availableQuantity ?? 0} u.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryPage;