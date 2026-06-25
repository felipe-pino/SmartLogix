import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
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

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
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
