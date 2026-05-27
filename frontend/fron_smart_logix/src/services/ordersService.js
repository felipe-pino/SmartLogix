const API_URL = "http://localhost:8080";

export async function getOrders() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las órdenes");
  }

  return await response.json();
}