import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllPayments } from "../services/paymentsService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { LuCreditCard, LuSearch } from "react-icons/lu";
import "../App.css";

function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // El backend expone GET /api/v1/payments (listado completo) solo para ROLE_ADMIN
    // (ver PaymentController.getAllPayments -> @PreAuthorize("hasRole('ADMIN')")).
    // Si no validamos el rol aquí, cualquier usuario logueado dispara la llamada,
    // recibe 403 y httpClient lo trata como "critical" -> redirige a "/" y pierde sesión.
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const role = user?.role || "ROLE_USER";
    const isAdmin = role === "ROLE_ADMIN";

    useEffect(() => {
        if (!isAdmin) {
            // No es admin: no tiene sentido pedir el listado global, evitamos el 403.
            setLoading(false);
            return;
        }

        async function loadPayments() {
            try {
                // Ejecutamos la llamada de forma limpia sin desestructuraciones confusas
                const response = await getAllPayments();

                // Validamos estrictamente que sea un arreglo antes de guardarlo para evitar pantallas en blanco
                if (Array.isArray(response)) {
                    setPayments(response);
                } else if (response && Array.isArray(response.content)) {
                    // Por si tu backend devuelve una respuesta paginada de Spring (.content)
                    setPayments(response.content);
                } else {
                    setPayments([]);
                }
            } catch (err) {
                setError("No se pudieron cargar los pagos. Verifique sus permisos o conexión.");
                console.error("Error cargando pagos:", err);
            } finally {
                setLoading(false);
            }
        }
        loadPayments();
    }, [isAdmin]);

    if (loading) {
        return <LoadingSpinner message="Cargando registro de pagos..." />;
    }

    if (!isAdmin) {
        return (
            <div className="inventory-container">
                <Navbar />
                <main className="inventory-table-section">
                    <div className="table-header">
                        <h2><LuCreditCard style={{ marginRight: '10px', color: '#60a5fa' }} /> Historial Global de Pagos</h2>
                    </div>
                    <div className="auth-alert error" style={{ margin: "20px" }}>
                        No tiene permisos para ver el historial global de pagos. Esta sección está
                        disponible solo para administradores.
                    </div>
                </main>
            </div>
        );
    }

    // Filtro tolerante a fallos y valores nulos (Usa encadenamiento opcional ?. )
    const filtered = Array.isArray(payments)
        ? payments.filter((p) => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return (
                p?.orderNumber?.toLowerCase().includes(term) ||
                p?.status?.toLowerCase().includes(term) ||
                p?.currency?.toLowerCase().includes(term)
            );
        })
        : [];

    return (
        <div className="inventory-container">
            <Navbar />

            <main className="inventory-table-section">
                <div className="table-header">
                    <h2><LuCreditCard style={{ marginRight: '10px', color: '#60a5fa' }} /> Historial Global de Pagos</h2>

                    <div className="search-container">
                        <LuSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por orden, estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    {error ? (
                        <div className="auth-alert error" style={{ margin: "20px" }}>{error}</div>
                    ) : filtered.length === 0 ? (
                        <p className="details-empty" style={{ padding: "40px", textAlign: "center" }}>
                            No se encontraron registros de transacciones.
                        </p>
                    ) : (
                        <table className="inventory-table">
                            <thead>
                            <tr>
                                <th>N° Orden</th>
                                <th>Estado</th>
                                <th>Monto</th>
                                <th>Moneda</th>
                                <th>Gateway ID</th>
                                <th>Fecha</th>
                                <th>Motivo Fallo</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id || Math.random()}>
                                    <td><span className="sku">{p.orderNumber}</span></td>
                                    <td>
                      <span className={`status ${(p.status === "APPROVED" || p.status === "SUCCESSFUL") ? "processed" : p.status === "PENDING" ? "pending" : "cancelled"}`}>
                        {p.status}
                      </span>
                                    </td>
                                    <td className="font-bold">{formatCurrency(p.amount)}</td>
                                    <td>{p.currency}</td>
                                    <td>
                                        {p.gatewayTransactionId ? (
                                            <span className="sku" style={{ fontSize: "12px" }}>{p.gatewayTransactionId}</span>
                                        ) : (
                                            <span className="badge-muted">—</span>
                                        )}
                                    </td>
                                    <td className="date-cell">{p.createdAt ? formatDate(p.createdAt) : "—"}</td>
                                    <td>
                                        {p.failureReason ? (
                                            <span className="text-danger" style={{ fontSize: "13px" }}>{p.failureReason}</span>
                                        ) : (
                                            <span className="badge-muted">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PaymentsPage;