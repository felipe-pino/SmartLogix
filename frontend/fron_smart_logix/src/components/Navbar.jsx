import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuPackage,
  LuShoppingCart,
  LuTruck,
  LuUser,
  LuLogOut,
  LuSettings,
  LuCreditCard,
  LuStore,
} from "react-icons/lu";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar la sesión de SmartLogix?")) {
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
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
      <nav className="sidenav">
        <div className="sidenav-brand">
          Smart<span style={{ color: "white" }}>Logix</span>
        </div>

        {/* ── Sección: Operaciones ── */}
        <div className="sidenav-menu">
          <span className="nav-section-label">Operaciones</span>

          <div className="nav-tooltip-wrapper">
            <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
              <LuLayoutDashboard className="nav-icon" />
              <span>Panel General</span>
            </Link>
            <span className="nav-tooltip">Panel General</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <Link to="/inventory" className={`nav-link ${isActive("/inventory")}`}>
              <LuPackage className="nav-icon" />
              <span>Inventario</span>
            </Link>
            <span className="nav-tooltip">Inventario</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <Link to="/orders" className={`nav-link ${isActive("/orders")}`}>
              <LuShoppingCart className="nav-icon" />
              <span>Órdenes</span>
            </Link>
            <span className="nav-tooltip">Órdenes</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <Link to="/payments" className={`nav-link ${isActive("/payments")}`}>
              <LuCreditCard className="nav-icon" />
              <span>Pagos</span>
            </Link>
            <span className="nav-tooltip">Pagos</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <Link to="/shipments" className={`nav-link ${isActive("/shipments")}`}>
              <LuTruck className="nav-icon" />
              <span>Envíos</span>
            </Link>
            <span className="nav-tooltip">Envíos</span>
          </div>

          {/* ── Separador hacia Accesos ── */}
          <div className="nav-divider" />
          <span className="nav-section-label">Accesos</span>

          <div className="nav-tooltip-wrapper">
            <Link to="/store" className={`nav-link ${isActive("/store")}`}>
              <span className="nav-icon-wrapper">
                <LuStore className="nav-icon" />
                <span className="nav-badge-dot" />
              </span>
              <span>Tienda</span>
            </Link>
            <span className="nav-tooltip">Tienda</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <Link to="/services" className={`nav-link nav-btn-services ${isActive("/services")}`}>
              <LuSettings className="nav-icon" />
              <span>Servicios</span>
            </Link>
            <span className="nav-tooltip">Servicios</span>
          </div>
        </div>

        {/* ── Footer: Cuenta ── */}
        <div className="sidenav-footer">
          <span className="nav-section-label">Cuenta</span>

          <div className="nav-tooltip-wrapper">
            <Link to="/profile" className={`nav-link ${isActive("/profile")}`}>
              <LuUser className="nav-icon" />
              <span>Mi Perfil</span>
            </Link>
            <span className="nav-tooltip">Mi Perfil</span>
          </div>

          <div className="nav-tooltip-wrapper">
            <button onClick={handleLogout} className="nav-link logout-btn-side">
              <LuLogOut className="nav-icon" />
              <span>Cerrar Sesión</span>
            </button>
            <span className="nav-tooltip">Cerrar Sesión</span>
          </div>
        </div>
      </nav>
  );
}

export default Navbar;