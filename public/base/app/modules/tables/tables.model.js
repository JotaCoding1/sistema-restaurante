// tables.model — regras e dados de apresentação das mesas.

import { pad2 } from "../../shared/format.js";

export const TABLE_STATUS = { FREE: "FREE", OCCUPIED: "OCCUPIED" };

export const isOccupied = (table) => table?.status === TABLE_STATUS.OCCUPIED;

// "Mesa 4" → "04"
export function tableNumber(table) {
  const n = String(table?.name ?? "").match(/\d+/)?.[0] ?? String(table?.id ?? "");
  return pad2(n);
}

export const tableLabel = (table) => `Mesa ${tableNumber(table)}`;

// Rótulo a partir só do id (quando a mesa não está carregada)
export const tableLabelById = (tables, tableId) =>
  tableLabel(tables.find((t) => t.id === tableId) ?? { id: tableId });

// Lugares por mesa — dados de demonstração: o back-end ainda não guarda a
// capacidade. Quando guardar, leia `table.seats` aqui.
const SEATS = { 1: 2, 2: 4, 3: 4, 4: 4, 5: 2, 6: 4, 7: 2, 8: 4, 9: 6, 10: 4, 11: 2, 12: 6 };
export const seatsOf = (table) => table?.seats ?? SEATS[table?.id] ?? 4;

export const tableStatusBadge = (table) =>
  isOccupied(table)
    ? `<span class="status status--busy">Ocupada</span>`
    : `<span class="status status--free">Livre</span>`;
