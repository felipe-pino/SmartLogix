/**
 * Formatea un número o string numérico a formato de moneda ($1,500.50)
 * Si el valor es inválido o no numérico, retorna $0.00
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num)) {
    return "$0.00";
  }
  return "$" + num.toFixed(2);
}

/**
 * Convierte una fecha en formato ISO (AAAA-MM-DD...) a formato español DD/MM/AAAA
 * Maneja valores nulos, vacíos o fechas inválidas devolviendo mensajes amigables
 */
export function formatDate(dateString) {
  if (!dateString) {
    return "Fecha no disponible";
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Normaliza un texto de búsqueda pasándolo a minúsculas y eliminando
 * los espacios en blanco innecesarios en los extremos.
 */
export function normalizeSearchTerm(text) {
  if (!text) {
    return "";
  }
  return text.trim().toLowerCase();
}