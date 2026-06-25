import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveLoginSession, normalizeSearchTerm } from "../services/authService";
import { LuFingerprint } from "react-icons/lu";
import "../App.css";

function LoginPage() {
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
      setMessage("Ingrese credenciales válidas");
      return;
    }

    try {
      setIsLoading(true);
      const response = await login({ credential: cleanCredential, password });

      saveLoginSession(response);
      setMessage("Autenticación exitosa. Iniciando enlace...");

      setTimeout(() => {
        navigate("/store");
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage(error.message || "Acceso denegado: Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="auth-page">
        <main className="auth-card">
          <header className="auth-header">
            <LuFingerprint style={{ fontSize: "50px", color: "var(--color-primary)", marginBottom: "15px" }} />
            <h2>SmartLogix</h2>
            <p>Terminal de Acceso Logístico</p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              Identificador de Red
              <input
                  type="text"
                  placeholder="Usuario o Email"
                  value={credential}
                  disabled={isLoading}
                  onChange={(event) => setCredential(event.target.value)}
                  className="auth-input"
                  autoComplete="off"
              />
            </label>

            <label className="auth-label">
              Clave de Seguridad
              <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  disabled={isLoading}
                  onChange={(event) => setPassword(event.target.value)}
                  className="auth-input"
              />
            </label>

            <button
                type="submit"
                className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
            >
              {isLoading ? "Validando..." : "Iniciar Sesión"}
            </button>
          </form>

          {message && (
              <div className={`auth-alert ${message.includes("exitosa") ? "success" : "error"}`}>
                {message}
              </div>
          )}

          <footer className="auth-footer">
            <button
                type="button"
                onClick={() => navigate("/register")}
                disabled={isLoading}
                className="auth-link-btn"
            >
              ¿No tienes acceso? <span>Regístrate aquí</span>
            </button>
          </footer>
        </main>
      </div>
  );
}

export default LoginPage;