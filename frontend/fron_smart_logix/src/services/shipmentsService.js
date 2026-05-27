const API_URL = "http://localhost:8080";

export async function getShipments() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/shipments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los envíos");
  }

  return await response.json();
}