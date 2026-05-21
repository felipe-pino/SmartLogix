import { useState } from "react";
import { login, saveLoginSession } from "../services/authService";
import "../App.css";

function LoginPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!credential.trim() || !password.trim()) {
      setMessage("Ingrese usuario/contraseña");
      return;
    }

    try {
      const response = await login({
        credential,
        password,
      });

      console.log(response);

      saveLoginSession(response);

      setMessage("Login correcto");
    } catch (error) {
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
            onChange={(event) => setCredential(event.target.value)}
            value={credential}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            value={password}
          />
        </label>

        <button type="submit">Login</button>

        <p>{message}</p>
      </form>
    </main>
  );
}

export default LoginPage;