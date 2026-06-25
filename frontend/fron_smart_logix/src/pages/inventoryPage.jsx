import { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { normalizeSearchTerm, formatDate } from "../utils/formatters";
import { LuSearch, LuPackage2 } from "react-icons/lu";
import "../App.css";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadInventory() {
      try {
        const data = await getInventory();
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
    return <LoadingSpinner message="Sincronizando Núcleo de Inventario..." />;
  }

  return (
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <div className="inventory-container anim-fade-up">

            <header className="inventory-header">
              <h1>Panel de Inventario</h1>
              <p>Monitoreo de existencias en tiempo real y flujo de mercancía.</p>
            </header>

            <section className="inventory-stats">
              <div className="stat-card blue-border anim-scale-in delay-1">
                <div className="stat-card-content">
                  <h3>SKUs Registrados</h3>
                  <p>{items.length}</p>
                </div>
              </div>
              <div className="stat-card anim-scale-in delay-2">
                <div className="stat-card-content">
                  <h3>Unidades Totales</h3>
                  <p>{items.reduce((acc, item) => acc + (item.availableQuantity || 0), 0)}</p>
                </div>
              </div>
              <div className="stat-card purple-border anim-scale-in delay-3">
                <div className="stat-card-content">
                  <h3>Valor Estimado</h3>
                  <p>$--</p>
                </div>
              </div>
            </section>

            <section className="inventory-table-section anim-fade-up delay-3">
              <div className="table-header">
                <h2>Catálogo Global de Productos</h2>

                <div className="search-container">
                  <input
                      type="text"
                      className="search-input"
                      placeholder="Buscar SKU, Nombre o Bodega..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <LuSearch className="search-icon-field" />
                </div>
              </div>

              <div className="table-scroll-wrapper">
                <table className="inventory-table">
                  <thead>
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>SKU</th>
                    <th>Producto</th>
                    <th style={{ whiteSpace: "nowrap" }}>Bodega</th>
                    <th style={{ whiteSpace: "nowrap" }}>Precio</th>
                    <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Stock</th>
                    <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Rsv.</th>
                    <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Mínimo</th>
                    <th style={{ whiteSpace: "nowrap" }}>Actualizado</th>
                    <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Estado</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
                          <LuPackage2 style={{ fontSize: "40px", marginBottom: "15px", color: "#334155" }} />
                          <p style={{fontWeight: 600, fontSize: '16px'}}>Niveles de inventario vacíos</p>
                          <p style={{fontSize: '14px'}}>No se encontraron coincidencias para "{searchTerm}".</p>
                        </td>
                      </tr>
                  ) : (
                      filteredItems.map((item, index) => {
                        const isAvailable = item.availableQuantity > 0;
                        const statusClass = isAvailable ? "available" : "unavailable";
                        const statusText = isAvailable ? "STOCK" : "AGOTADO";

                        return (
                            <tr key={item.sku} className="anim-fade-up" style={{animationDelay: `${0.1 + (index * 0.03)}s`}}>
                              <td style={{ whiteSpace: "nowrap" }}>
                                <span className="sku">{item.sku}</span>
                              </td>

                              <td style={{ fontWeight: 700, color: 'white', minWidth: '180px' }}>
                                {item.productName}
                              </td>

                              <td style={{ whiteSpace: "nowrap" }}>
                                {item.warehouseCode ? (
                                    <span className="text-light">{item.warehouseCode}</span>
                                ) : (
                                    <span className="badge-muted">N/A</span>
                                )}
                              </td>

                              <td style={{ whiteSpace: "nowrap", color: "#e2e8f0" }}>
                                {item.price !== undefined && item.price !== null ? (
                                    `$${Number(item.price).toFixed(2)}`
                                ) : (
                                    <span className="badge-muted">N/A</span>
                                )}
                              </td>

                              <td className={`font-bold ${item.availableQuantity > 0 ? "text-success" : "text-danger"}`} style={{ fontSize: '16px', textAlign: "center" }}>
                                {item.availableQuantity}
                              </td>

                              <td className="text-muted" style={{ textAlign: "center" }}>
                                {item.reservedQuantity || 0}
                              </td>

                              <td className="text-muted" style={{ textAlign: "center" }}>
                                {item.reorderLevel || 0}
                              </td>

                              <td className="date-cell" style={{ whiteSpace: "nowrap" }}>
                                {item.updatedAt ? formatDate(item.updatedAt) : <span className="badge-muted">Sin registro</span>}
                              </td>

                              <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                                <span className={`status ${statusClass}`}>
                                  {statusText}
                                </span>
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

export default InventoryPage;