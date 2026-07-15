import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import OrderStatusChart from "../components/OrderStatusChart.jsx";
import { getInventory } from "../services/inventoryService";
import { getOrders, getOrderSummary } from "../services/ordersService";
import { getShipments } from "../services/shipmentsService";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
    LuLayoutDashboard, LuPackage, LuShoppingCart, LuTruck,
    LuChartBar, LuClock, LuTrendingUp, LuBoxes, LuActivity
} from "react-icons/lu";
import "../App.css";

function DashboardPage() {
    const [data, setData] = useState({
        inventory: [],
        orders: [],
        shipments: []
    });
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAllData() {
            try {
                const [invData, ordData, shipData, summaryData] = await Promise.all([
                    getInventory(),
                    getOrders(),
                    getShipments(),
                    getOrderSummary(),
                    new Promise((resolve) => setTimeout(resolve, 800))
                ]);

                setData({
                    inventory: invData || [],
                    orders: ordData || [],
                    shipments: shipData || []
                });
                setSummary(summaryData || {});
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

    const totalStock = data.inventory.reduce((acc, item) => acc + (item.availableQuantity || 0), 0);
    const totalRevenue = data.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pendingOrders = data.orders.filter(o => o.status === "PENDING").length;

    const activeShipments = data.shipments.filter(s =>
        s.status !== "DELIVERED" &&
        s.status !== "CANCELLED" &&
        s.status !== "FAILED"
    ).length;

    // NUEVO: bodega con más unidades — dato ya disponible en data.inventory, solo se calcula distinto
    const stockByWarehouse = data.inventory.reduce((acc, item) => {
        const wh = item.warehouseCode || "N/A";
        acc[wh] = (acc[wh] || 0) + (item.availableQuantity || 0);
        return acc;
    }, {});
    const topWarehouse = Object.entries(stockByWarehouse).sort((a, b) => b[1] - a[1])[0];

    // NUEVO: últimas 4 órdenes, ordenadas por fecha de creación descendente
    const recentOrders = [...data.orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    const ORDER_STATUS_STYLE = {
        PENDING: { color: "#facc15", label: "Pendiente" },
        APPROVED: { color: "#38bdf8", label: "Aprobada" },
        SHIPMENT_REQUESTED: { color: "#a78bfa", label: "En Despacho" },
        REJECTED: { color: "#f87171", label: "Rechazada" },
        FAILED: { color: "#ef4444", label: "Fallida" }
    };

    return (
        <div className="app-layout">
            <Navbar />

            <main className="main-content">
                <div className="inventory-container anim-fade-up">

                    <header className="inventory-header">
                        <h1><LuLayoutDashboard style={{marginRight: '15px', color: 'var(--color-primary)'}}/>Centro de Comando</h1>
                        <p>Visión global de la operación logística y estado de la red.</p>
                    </header>

                    {/* Tarjetas de Resumen Global (con badges de ícono agregados) */}
                    <section className="inventory-stats">

                        <div className="stat-card blue-border anim-scale-in delay-1">
                            <div className="stat-card-content">
                                <div className="kpi-top-row">
                                    <h3><LuPackage style={{marginRight: '8px'}}/> Unidades en Red</h3>
                                    <span className="kpi-icon-badge kpi-badge-blue"><LuBoxes /></span>
                                </div>
                                <p>{totalStock}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    Repartidas en {data.inventory.length} SKUs únicos.
                                </span>
                                {topWarehouse && (
                                    <span className="kpi-pill">
                                        Bodega líder: <strong>{topWarehouse[0]}</strong> ({topWarehouse[1]} u.)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={`stat-card anim-scale-in delay-2 ${pendingOrders > 0 ? "purple-border" : ""}`}>
                            <div className="stat-card-content">
                                <div className="kpi-top-row">
                                    <h3><LuShoppingCart style={{marginRight: '8px'}}/> Ingresos (Flujo)</h3>
                                    <span className="kpi-icon-badge kpi-badge-purple"><LuTrendingUp /></span>
                                </div>
                                <p className="stat-text-blue" style={{fontSize: '36px'}}>{formatCurrency(totalRevenue)}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    {pendingOrders} órdenes pendientes de procesamiento.
                                </span>
                                <span className="kpi-pill">
                                    {data.orders.length} órdenes totales registradas
                                </span>
                            </div>
                        </div>

                        <div className={`stat-card anim-scale-in delay-3 ${activeShipments > 0 ? "green-border" : ""}`}>
                            <div className="stat-card-content">
                                <div className="kpi-top-row">
                                    <h3><LuTruck style={{marginRight: '8px'}}/> Logística Activa</h3>
                                    <span className="kpi-icon-badge kpi-badge-green"><LuActivity /></span>
                                </div>
                                <p className={activeShipments > 0 ? "stat-text-green" : ""}>{activeShipments}</p>
                                <span className="text-muted" style={{fontSize: '13px', marginTop: '10px', display: 'block'}}>
                                    Envíos en proceso o ruta. (Total histórico: {data.shipments.length})
                                </span>
                            </div>
                        </div>

                    </section>

                    {/* NUEVO LAYOUT: dos columnas — gráfico a la izquierda, actividad reciente a la derecha */}
                    <section className="dashboard-grid anim-fade-up delay-4">

                        <div className="inventory-table-section dashboard-chart-card">
                            <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
                                <LuChartBar style={{color: 'var(--color-primary)'}} />
                                Órdenes por Estado
                            </h2>
                            <OrderStatusChart summary={summary} />
                        </div>

                        <div className="inventory-table-section dashboard-activity-card">
                            <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
                                <LuClock style={{color: 'var(--color-secondary)'}} />
                                Actividad Reciente
                            </h2>

                            {recentOrders.length === 0 ? (
                                <p className="text-muted" style={{textAlign: 'center', padding: '30px'}}>
                                    Sin actividad reciente.
                                </p>
                            ) : (
                                <div className="activity-list">
                                    {recentOrders.map((order) => {
                                        const style = ORDER_STATUS_STYLE[order.status] || { color: "#94a3b8", label: order.status };
                                        return (
                                            <div key={order.orderNumber} className="activity-item">
                                                <span className="activity-dot" style={{ background: style.color, boxShadow: `0 0 8px ${style.color}` }} />
                                                <div className="activity-info">
                                                    <span className="activity-order-number">{order.orderNumber}</span>
                                                    <span className="activity-date">{order.createdAt ? formatDate(order.createdAt) : "Sin fecha"}</span>
                                                </div>
                                                <span className="activity-status-badge" style={{ color: style.color, borderColor: style.color }}>
                                                    {style.label}
                                                </span>
                                                <span className="activity-amount">{formatCurrency(order.totalAmount)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </section>

                </div>
            </main>
        </div>
    );
}

export default DashboardPage;