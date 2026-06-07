import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function ProfilePage() {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { username: "Desconocido", role: "Sin Rol" };

  return (
    <div className="inventory-container">
      <Navbar />

      <main className="inventory-table-section profile-wrapper">
        <div className="table-header">
          <h2>👤 Mi Perfil</h2>
        </div>

        <div className="profile-card">
          
          <div className="profile-field">
            <label className="auth-label">Nombre de Usuario</label>
            <input type="text" className="auth-input" value={user.username} disabled />
          </div>

          <div className="profile-field">
            <label className="auth-label">Rol en el Sistema</label>
            <input type="text" className="auth-input text-highlight" value={user.role} disabled />
          </div>

          <button className="auth-submit-btn" onClick={() => navigate("/inventory")}>
            Volver al Inventario
          </button>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;