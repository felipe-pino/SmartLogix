import { Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const activeClass = (path) => (location.pathname === path ? "nav-btn active" : "nav-btn");
  
  // Verifica si la pestaña de servicios está seleccionada
  const servicesClass = location.pathname === "/services" ? "nav-btn-services active" : "nav-btn-services";

  return (
    <header className="inventory-header" style={{ borderBottom: "1px solid #1e293b", paddingBottom: "20px" }}>
      
      {/* 1. SECCIÓN DE TÍTULO */}
      <div>
        <h1 style={{ fontSize: "32px", margin: "0 0 5px 0" }}>SmartLogix Platform</h1>
        <p style={{ margin: 0, color: "#94a3b8" }}>Sistema Central Integrado de Operaciones</p>
      </div>

      {/* 2. SECCIÓN PRINCIPAL DE NAVEGACIÓN */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/inventory">
          <button className={activeClass("/inventory")}>Inventario</button>
        </Link>
        <Link to="/orders">
          <button className={activeClass("/orders")}>Órdenes</button>
        </Link>
        <Link to="/shipments">
          <button className={activeClass("/shipments")}>Envíos</button>
        </Link>
        <Link to="/profile">
          <button className={activeClass("/profile")}>Perfil</button>
        </Link>
      </div>

      {/* 3. SECCIÓN DE ADMINISTRACIÓN Y SALIDA */}
      <div className="navbar-actions">
        
        {/* Botón del Panel de Servicios (Púrpura con animación nativa por CSS) */}
        <Link to="/services" style={{ textDecoration: "none" }}>
          <button className={servicesClass}>
            Panel de Servicios
          </button>
        </Link>

        {/* Botón de Cerrar Sesión (Rojo con animación nativa por CSS) */}
        <button className="logout-btn-red" onClick={handleLogout}>
          Cerrar sesión
        </button>

      </div>

    </header>
  );
}

export default Navbar;