import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/loginPage";
import RegisterPage from "./pages/RegisterPage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";

// 1. IMPORTAMOS EL NUEVO DASHBOARD
import DashboardPage from "./pages/DashboardPage";

// VALIDADOR NATIVO SEGURO CON LOCALSTORAGE
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

                    {/* Rutas Protegidas de la aplicación */}

                    {/* 2. AGREGAMOS LA NUEVA RUTA DEL DASHBOARD PROTEGIDA */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <InventoryPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrdersPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/shipments"
                        element={
                            <ProtectedRoute>
                                <ShipmentsPage />
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

                </Routes>

            </div>
        </BrowserRouter>
    );
}

export default App;