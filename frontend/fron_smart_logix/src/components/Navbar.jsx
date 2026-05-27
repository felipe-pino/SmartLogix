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

  return (
    <header className="inventory-header" style={{ borderBottom: "1px solid #1e293b", paddingBottom: "20px" }}>
      <div>
        <h1 style={{ fontSize: "32px" }}>SmartLogix Platform</h1>
        <p>Sistema Central Integrado de Operaciones</p>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/inventory">
          <button className={activeClass("/inventory")}>Inventario</button>
        </Link>
        <Link to="/orders">
          <button className={activeClass("/orders")}>Órdenes</button>
        </Link>
        <Link to="/shipments">
          <button className={activeClass("/shipments")}>Envíos</button>
        </Link>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </header>
  );
}

export default Navbar;