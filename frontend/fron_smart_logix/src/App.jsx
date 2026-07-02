import { useEffect } from "react";
import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

import Login from "./pages/loginPage";
import RegisterPage from "./pages/RegisterPage";
import InventoryPage from "./pages/inventoryPage";
import OrdersPage from "./pages/OrdersPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import StorePage from "./pages/StorePage";
import { isSessionValid } from "./utils/jwt";

// Cada cuánto se revisa que nadie haya tocado localStorage mientras
// el usuario ya está adentro de una vista protegida (sin navegar).
const SESSION_WATCH_INTERVAL_MS = 1500;

/**
 * Cierra la sesión "a la fuerza" preservando las tarjetas guardadas,
 * igual que el logout normal, y manda al login.
 */
function forceLogout(navigate) {
    const savedCards = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("paymentMethod_")) {
            savedCards[key] = localStorage.getItem(key);
        }
    }

    localStorage.clear();

    Object.entries(savedCards).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });

    navigate("/", { replace: true });
}

function ProtectedRoute({ children }) {
    const navigate = useNavigate();

    // Vigilancia activa: si el token expira, se vence, o el rol guardado en
    // localStorage deja de coincidir con el rol firmado dentro del JWT
    // (indicio de que alguien lo editó a mano para saltarse permisos),
    // se cierra la sesión y se redirige al login, aunque el usuario no
    // navegue ni recargue la página.
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSessionValid()) {
                forceLogout(navigate);
            }
        }, SESSION_WATCH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [navigate]);

    if (!isSessionValid()) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <div className="container">

                <Routes>

                    {/* Rutas Públicas */}
                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />

                    {/* TIENDA (clientes) */}
                    <Route
                        path="/store"
                        element={
                            <ProtectedRoute>
                                <StorePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* DASHBOARD — ruta que faltaba y causaba que el link de Navbar no funcionara */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* INVENTARIO */}
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <InventoryPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ÓRDENES */}
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrdersPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* EMBARQUES / DESPACHOS */}
                    <Route
                        path="/shipments"
                        element={
                            <ProtectedRoute>
                                <ShipmentsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* PAGOS */}
                    <Route
                        path="/payments"
                        element={
                            <ProtectedRoute>
                                <PaymentsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* MÉTODO DE PAGO */}
                    <Route
                        path="/payment-method"
                        element={
                            <ProtectedRoute>
                                <PaymentMethodPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/services"
                        element={
                            <ProtectedRoute>
                                <ServicesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirección automática a la tienda en caso de ruta inválida */}
                    <Route
                        path="*"
                        element={<Navigate to="/store" replace />}
                    />

                </Routes>

            </div>
        </BrowserRouter>
    );
}

export default App;
