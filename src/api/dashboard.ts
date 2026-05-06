import { API_URL } from "./http";

export async function getDashboardSummary() {
  const response = await fetch(`${API_URL}/api/dashboard/summary`);
  if (!response.ok) {
    throw new Error('Error al obtener el resumen');
  }
  return response.json(); // Devuelve el JSON con la misma estructura que el mock
}