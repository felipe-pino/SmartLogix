import { createContext, useState, useEffect, useContext } from "react";

// 1. Creación del contexto
export const AuthContext = createContext(null);

// 2. Proveedor de autenticación (Componente JS puro)
export function AuthProvider(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Retornamos el objeto del Provider nativo usando React.createElement por detrás
  return {
    $$typeof: Symbol.for("react.element"),
    type: AuthContext.Provider,
    key: null,
    ref: null,
    props: {
      value: { isAuthenticated, loading, login, logout },
      children: !loading ? props.children : null,
    },
  };
}

// 3. Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}