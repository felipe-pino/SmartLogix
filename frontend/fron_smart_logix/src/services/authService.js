const API_URL_BASE = "http://localhost:8080";

export async function login({ credential, password }) {
  const response = await fetch(`${API_URL_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al iniciar sesión");
  }

  const data = await response.json();

  return data;
}

export function saveLoginSession(loginResponse) {
  localStorage.setItem("token", loginResponse.token);

  localStorage.setItem(
    "user",
    JSON.stringify({
      username: loginResponse.username,
      role: loginResponse.role,
      tokenType: loginResponse.tokenType || "Bearer",
    })
  );
}

export { API_URL_BASE };

//cambio