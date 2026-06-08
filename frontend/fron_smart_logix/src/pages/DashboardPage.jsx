import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { getInventory } from "../services/inventoryService";
import { getOrders } from "../services/ordersService";
import { getShipments } from "../services/shipmentsService";
import { formatCurrency } from "../utils/formatters";
import { LuLayoutDashboard, LuPackage, LuShoppingCart, LuTruck } from "react-icons/lu";
import "../App.css";

function DashboardPage() {
    const [data, setData] = useState({
        inventory: [],
        orders: [],
        shipments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAllData() {
            try {
                // Ejecutamos todas las peticiones al mismo tiempo para mayor velocidad
                const [invData, ordData, shipData] = await Promise.all([
                    getInventory(),
                    getOrders(),
                    getShipments(),
                    new Promise((resolve) => setTimeout(resolve, 800)) // Animación fluida
                ]);

                setData({
                    inventory: invData || [],
                    orders: ordData || [],
                    shipments: shipData || []
                });
            } catch (error) {
                console.error("Error cargando el Dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        loadAllData();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Iniciando Panel de Control Global..." />;
    }

    // Cálculos rápidos para el resumen
    const totalStock = data.inventory.reduce((acc, item) => acc + (item.availableQuantity || 0), 0);
    const totalRevenue = data.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pendingOrders = data.orders.filter(o => o.status === "PENDING").length;

    // CORRECCIÓN: Contar como activos todos los que estén en proceso (PLANNED, PICKED_UP, IN_TRANSIT, etc.)
    const activeShipments = data.shipments.filter(s =>
        s.status !== "DELIVERED" &&
        s.status !== "CANCELLED" &&
        s.status !== "FAILED"
    ).length;

    return (
        <div className="app-layout">
            <Navbar />

            <main className="main-content">
                <div className="inventory-container anim-fade-up">

                    <header className="inventory-header">
                        <h1><LuLayoutDashboard style={{marginRight: '15px', color: 'var(--color-primary)'}}/>Centro de Comando</h1>
                        <p>Visión global de la operación logística y estado de la red.</p>
                    </header>

                    {/* Tarjetas de Resumen Global */}
                    <section className="inventory-stats">

                        {/* Tarjeta de Inventario */}
                        <div className="stat-card anim-scale-in delay-1">
                            <div className="stat-card-content">
                                <h3><LuPackage style={{marginRight: '8px'}}/> Unidades en Red</h3>
                                <p>{totalStock}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    Repartidas en {data.inventory.length} SKUs únicos.
                                </span>
                            </div>
                        </div>

                        {/* Tarjeta de Órdenes */}
                        <div className={`stat-card anim-scale-in delay-2 ${pendingOrders > 0 ? "purple-border" : ""}`}>
                            <div className="stat-card-content">
                                <h3><LuShoppingCart style={{marginRight: '8px'}}/> Ingresos (Flujo)</h3>
                                <p className="stat-text-blue" style={{fontSize: '36px'}}>{formatCurrency(totalRevenue)}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    {pendingOrders} órdenes pendientes de procesamiento.
                                </span>
                            </div>
                        </div>

                        {/* Tarjeta de Envíos */}
                        <div className={`stat-card anim-scale-in delay-3 ${activeShipments > 0 ? "green-border" : ""}`}>
                            <div className="stat-card-content">
                                <h3><LuTruck style={{marginRight: '8px'}}/> Logística Activa</h3>
                                <p className={activeShipments > 0 ? "stat-text-green" : ""}>{activeShipments}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    Envíos en proceso o ruta. (Total histórico: {data.shipments.length})
                                </span>
                            </div>
                        </div>

                    </section>

                    {/* Espacio para futuros gráficos o tablas resumen */}
                    <section className="inventory-table-section anim-fade-up delay-4" style={{marginTop: '40px', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                        <LuLayoutDashboard style={{fontSize: '60px', color: 'rgba(56, 189, 248, 0.1)', marginBottom: '20px'}} />
                        <h2 style={{color: 'var(--text-muted)'}}>Módulo de Análisis Próximamente</h2>
                        <p style={{color: '#64748b', fontSize: '14px', marginTop: '10px'}}>El despliegue de gráficas de rendimiento está programado para la siguiente fase.</p>
                    </section>

                </div>
            </main>
        </div>
    );
}

export default DashboardPage;