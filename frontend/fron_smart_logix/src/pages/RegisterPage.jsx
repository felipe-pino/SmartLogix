import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { register, normalizeSearchTerm } from "../services/authService"; 
import "../App.css";

function RegisterPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  
  const navigate = useNavigate(); 

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanCredential = normalizeSearchTerm(credential);

    if (!cleanCredential || !password.trim()) {
      setMessage("Ingrese usuario y contraseña");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsLoading(true);
      
      await register({ 
        username: cleanCredential, 
        email: `${cleanCredential}@smartlogix.com`, 
        password: password 
      });
      
      setMessage("¡Usuario registrado con éxito!");

      setTimeout(() => {
        navigate("/"); 
      }, 1500);
      
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Error en el registro");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <main className="auth-card">
        <header className="auth-header">
          <h2>Nuevo Registro</h2>
          <p>Únete a la red SmartLogix</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Nombre de Usuario
            <input
              type="text"
              placeholder="Crea tu nombre de usuario"
              value={credential}
              disabled={isLoading}
              onChange={(event) => setCredential(event.target.value)}
              className="auth-input"
            />
          </label>

          <label className="auth-label">
            Contraseña
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
            />
          </label>

          <button 
            type="submit" 
            className={`auth-submit-btn register ${isLoading ? "loading" : ""}`} 
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {message && (
          <div className={`auth-alert ${message.includes("éxito") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <footer className="auth-footer">
          <button 
            type="button" 
            onClick={() => navigate("/")} 
            disabled={isLoading}
            className="auth-link-btn"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </button>
        </footer>
      </main>
    </div>
  );
}

export default RegisterPage;