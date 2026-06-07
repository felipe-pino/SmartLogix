import { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";
import Navbar from "../components/Navbar"; 
import LoadingSpinner from "../components/LoadingSpinner";
import { normalizeSearchTerm, formatDate } from "../utils/formatters"; 
import "../App.css";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    async function loadInventory() {
      try {
        const [data] = await Promise.all([
          getInventory(),
          new Promise((resolve) => setTimeout(resolve, 1000))
        ]);
        setItems(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const filteredItems = items.filter((item) => {
    const term = normalizeSearchTerm(searchTerm);
    return (
      item.productName?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.warehouseCode?.toLowerCase().includes(term) 
    );
  });

  if (loading) {
    return <LoadingSpinner message="Cargando inventario..." />;
  }

  return (
    <div className="inventory-container">
      <Navbar />

      <section className="inventory-stats">
        <div className="stat-card">
          <h3>Productos Registrados</h3>
          <p>{items.length}</p>
        </div>
        <div className="stat-card">
          <h3>Unidades Disponibles</h3>
          <p>{items.reduce((acc, item) => acc + (item.availableQuantity || 0), 0)}</p>
        </div>
      </section>

      <section className="inventory-table-section">
        <div className="table-header">
          <h2>Catálogo de Productos</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, SKU o bodega..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Bodega</th>
                <th>Disponibles</th>
                <th>Reservados</th>
                <th>Reorden (Nivel)</th>
                <th>Actualizado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isAvailable = item.availableQuantity > 0;
                const statusClass = isAvailable ? "available" : "unavailable";
                const statusText = isAvailable ? "DISPONIBLE" : "AGOTADO";

                return (
                  <tr key={item.sku}>
                    <td className="sku">{item.sku}</td>
                    <td className="font-bold">{item.productName}</td>
                    <td className="text-light">{item.warehouseCode || "N/A"}</td>
                    
                    <td className={`font-bold ${item.availableQuantity > 0 ? "text-success" : "text-danger"}`}>
                      {item.availableQuantity}
                    </td>
                    
                    <td className="text-muted">
                      {item.reservedQuantity || 0}
                    </td>
                    
                    <td className="text-muted">
                      {item.reorderLevel || 0}
                    </td>

                    <td className="date-cell">
                      {item.updatedAt ? formatDate(item.updatedAt) : "---"}
                    </td>

                    <td>
                      <span className={`status ${statusClass}`}>
                        {statusText}
                      </span>
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

export default InventoryPage;