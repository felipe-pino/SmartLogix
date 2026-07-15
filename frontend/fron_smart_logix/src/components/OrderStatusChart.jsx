import { useMemo } from "react";

// Colores por estado — mismos que las barras del resumen
const STATUS_COLORS = {
    PENDING: "#facc15",
    APPROVED: "#38bdf8",
    SHIPMENT_REQUESTED: "#a78bfa",
    REJECTED: "#f87171",
    FAILED: "#ef4444"
};

const STATUS_LABELS = {
    PENDING: "Pendientes",
    APPROVED: "Aprobadas",
    SHIPMENT_REQUESTED: "En Despacho",
    REJECTED: "Rechazadas",
    FAILED: "Fallidas"
};

/**
 * Gráfico de dona (donut chart) hecho con SVG puro.
 * No requiere ninguna librería externa (recharts, chart.js, etc.),
 * por lo que no hay que tocar package.json ni correr npm install.
 *
 * Props:
 *  - summary: objeto tipo { PENDING: 3, APPROVED: 10, ... }
 */
function OrderStatusChart({ summary }) {
    const entries = Object.entries(summary || {});
    const total = entries.reduce((acc, [, count]) => acc + count, 0);

    const size = 220;
    const strokeWidth = 26;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const segments = useMemo(() => {
        let acumulado = 0;
        return entries.map(([status, count]) => {
            const fraction = total > 0 ? count / total : 0;
            const dash = fraction * circumference;
            const segment = {
                status,
                count,
                color: STATUS_COLORS[status] || "#94a3b8",
                label: STATUS_LABELS[status] || status,
                dashArray: `${dash} ${circumference - dash}`,
                dashOffset: -acumulado
            };
            acumulado += dash;
            return segment;
        });
    }, [entries, total, circumference]);

    if (total === 0) {
        return (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: "rgba(148, 163, 184, 0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px"
                }}>
                    <span style={{ fontSize: "32px" }}>📊</span>
                </div>
                <p className="text-muted" style={{ fontSize: "15px" }}>
                    Aún no hay órdenes registradas para graficar.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "45px", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ position: "relative", filter: "drop-shadow(0 0 18px rgba(167, 139, 250, 0.25))" }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={strokeWidth}
                        />
                        {segments.map((seg) => (
                            <circle
                                key={seg.status}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={seg.dashArray}
                                strokeDashoffset={seg.dashOffset}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dasharray 0.8s ease" }}
                            />
                        ))}
                    </g>
                    <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        fontSize="38"
                        fontWeight="800"
                        fill="#f1f5f9"
                    >
                        {total}
                    </text>
                    <text
                        x="50%"
                        y="62%"
                        textAnchor="middle"
                        fontSize="13"
                        fill="#94a3b8"
                        letterSpacing="1px"
                    >
                        ÓRDENES
                    </text>
                </svg>
            </div>

            {/* Leyenda en tarjetas pequeñas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                {segments.map((seg) => (
                    <div key={seg.status} className="chart-legend-item">
                        <span className="chart-legend-dot" style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}` }} />
                        <span className="chart-legend-label">{seg.label}</span>
                        <span className="chart-legend-count" style={{ color: seg.color }}>
                            {seg.count}
                        </span>
                        <span className="chart-legend-percent">
                            {Math.round((seg.count / total) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderStatusChart;