// Tramos del panel de vencimientos. El frontend les pone color:
// VENCIDO y DIAS_30 en rojo, DIAS_60 en ámbar, DIAS_90 en amarillo.
export type Tramo = "VENCIDO" | "DIAS_30" | "DIAS_60" | "DIAS_90";

export const DIAS_PANEL = 90;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Días que faltan para el vencimiento (negativo si ya venció). Ambas fechas a medianoche UTC.
export function diasRestantes(fechaVencimiento: Date, hoy: Date): number {
  return Math.round((fechaVencimiento.getTime() - hoy.getTime()) / MS_POR_DIA);
}

// Un lote que vence hoy todavía se puede vender, así que cuenta en DIAS_30 y no en VENCIDO.
// Devuelve null si vence a más de 90 días: no aparece en el panel.
export function tramoDe(dias: number): Tramo | null {
  if (dias < 0) return "VENCIDO";
  if (dias <= 30) return "DIAS_30";
  if (dias <= 60) return "DIAS_60";
  if (dias <= DIAS_PANEL) return "DIAS_90";
  return null;
}
