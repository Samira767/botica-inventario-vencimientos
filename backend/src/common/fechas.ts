// Las fechas de vencimiento son columnas DATE: Prisma las entrega como medianoche UTC.
// "Hoy" se calcula con el calendario de Perú, no con el del servidor (que en la nube suele estar en UTC).
export function hoyEnLima(ahora: Date = new Date()): Date {
  const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(ahora);
  return new Date(`${fecha}T00:00:00.000Z`);
}
