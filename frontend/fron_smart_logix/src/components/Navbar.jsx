import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuPackage, LuShoppingCart,
  LuTruck, LuUser, LuLogOut, LuSettings
} from "react-icons/lu";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar la sesión de SmartLogix?")) {
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
      <nav className="sidenav">
        <div className="sidenav-brand">
          Smart<span style={{color: 'white'}}>Logix</span>
        </div>

        <div className="sidenav-menu">
          {/* Panel General ahora tiene su propia ruta independiente */}
          <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
            <LuLayoutDashboard className="nav-icon" />
            <span>Panel General</span>
          </Link>

          {/* Inventario ahora reclamará correctamente su estado activo */}
          <Link to="/inventory" className={`nav-link ${isActive("/inventory")}`}>
            <LuPackage className="nav-icon" />
            <span>Inventario</span>
          </Link>

          <Link to="/orders" className={`nav-link ${isActive("/orders")}`}>
            <LuShoppingCart className="nav-icon" />
            <span>Órdenes</span>
          </Link>

          <Link to="/shipments" className={`nav-link ${isActive("/shipments")}`}>
            <LuTruck className="nav-icon" />
            <span>Envíos</span>
          </Link>

          <Link to="/services" className={`nav-link nav-btn-services ${isActive("/services")}`}>
            <LuSettings className="nav-icon" />
            <span>Servicios</span>
          </Link>
        </div>

        <div className="sidenav-footer">
          <Link to="/profile" className={`nav-link ${isActive("/profile")}`}>
            <LuUser className="nav-icon" />
            <span>Mi Perfil</span>
          </Link>

          <button onClick={handleLogout} className="nav-link logout-btn-side">
            <LuLogOut className="nav-icon" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
  );
}

export default Navbar;