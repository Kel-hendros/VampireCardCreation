export async function cargarRecursos() {
  const response = await fetch("data/recursos.json");
  return await response.json();
}
export async function cargarClanes() {
  const response = await fetch("data/clanes.json");
  const data = await response.json();
  return data.clanes;
}
