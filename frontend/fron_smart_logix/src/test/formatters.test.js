import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, normalizeSearchTerm } from "../utils/formatters.js";

describe("Pruebas Unitarias - Módulo de Formateadores (Utils)", () => {

  // ==========================================
  // 1. PRUEBAS PARA FORMAT CURRENCY
  // ==========================================
  describe("Función formatCurrency", () => {
    it("debe formatear un número correctamente a formato moneda con dos decimales", () => {
      const resultado = formatCurrency(1500.5);
      expect(resultado).toBe("$1500.50");
    });

    it("debe formatear un string numérico correctamente", () => {
      const resultado = formatCurrency("250.758");
      expect(resultado).toBe("$250.76"); // Redondea al segundo decimal
    });

    it("debe retornar $0.00 si se le pasa un valor que no es un número", () => {
      const resultado = formatCurrency("texto_invalido");
      expect(resultado).toBe("$0.00");
    });

    it("debe manejar el número 0 correctamente", () => {
      const resultado = formatCurrency(0);
      expect(resultado).toBe("$0.00");
    });
  });

  // ==========================================
  // 2. PRUEBAS PARA FORMAT DATE
  // ==========================================
  describe("Función formatDate", () => {
    it("debe formatear una fecha ISO correctamente a formato español DD/MM/AAAA", () => {
      // Usamos el mediodía local para evitar desfases de zonas horarias en la máquina del evaluador
      const resultado = formatDate("2026-06-15T12:00:00");
      expect(resultado).toBe("15/06/2026");
    });

    it("debe retornar 'Fecha no disponible' si el valor es nulo o vacío", () => {
      const resultadoNull = formatDate(null);
      const resultadoUndefined = formatDate(undefined);
      
      expect(resultadoNull).toBe("Fecha no disponible");
      expect(resultadoUndefined).toBe("Fecha no disponible");
    });

    it("debe retornar 'Fecha inválida' si el string no tiene formato de fecha real", () => {
      const resultado = formatDate("esto-no-es-una-fecha");
      expect(resultado).toBe("Fecha inválida");
    });
  });

  // ==========================================
  // 3. PRUEBAS PARA NORMALIZE SEARCH TERM
  // ==========================================
  describe("Función normalizeSearchTerm", () => {
    it("debe transformar el texto a minúsculas y quitar espacios en los extremos", () => {
      const resultado = normalizeSearchTerm("   Laptop ASUS   ");
      expect(resultado).toBe("laptop asus");
    });

    it("debe retornar un string vacío si recibe un valor nulo o indefinido", () => {
      const resultado = normalizeSearchTerm(null);
      expect(resultado).toBe("");
    });
  });

}); 