// reservations.model — regras das reservas.

export function isUpcoming(reservation, now = new Date()) {
  const [h, m] = reservation.time.split(":").map(Number);
  const at = new Date(now);
  at.setHours(h, m, 0, 0);
  return at.getTime() > now.getTime();
}

// Próxima reserva futura de uma mesa (ou null)
export const nextReservationFor = (reservations, tableId) =>
  reservations.find((r) => r.tableId === tableId && isUpcoming(r)) ?? null;

// "19:00" → "19h", "19:30" → "19h30"
export function hourLabel(time) {
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
