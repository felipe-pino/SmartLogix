import { useState } from "react";
// 1. Importamos useNavigate
import { useNavigate } from "react-router-dom"; 
import { login, saveLoginSession } from "../services/authService";
import "../App.css";

function LoginPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // 2. Inicializamos el hook de navegación
  const navigate = useNavigate(); 

  async function handleSubmit(event) {
    event.preventDefault();

    if (!credential.trim() || !password.trim()) {
      setMessage("Ingrese usuario/contraseña");
      return;
    }

    try {
      const response = await login({ credential, password });
      console.log(response);

      saveLoginSession(response);
      setMessage("Login correcto");

      // 3. Redirigimos al usuario a la página de inventario
      navigate("/inventory"); 
      
    } catch (error) {
      console.error(error);
      setMessage("Credenciales incorrectas");
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <label>
          Credenciales
          <input
            type="text"
            value={credential}
            onChange={(event) => setCredential(event.target.value)}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit">Login</button>
        <p>{message}</p>
      </form>
    </main>
  );
}

export default LoginPage;