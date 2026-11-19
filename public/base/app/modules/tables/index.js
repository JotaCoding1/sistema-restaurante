// Interface pública do módulo tables
// Responsável por: listar e abrir mesas, status Livre/Ocupada, cartões de mesa.
// Depende de: nenhum módulo.

import { emit } from "../../shared/events.js";
import { fetchTables, requestOpenTable } from "./tables.api.js";

export const listTables = fetchTables;

export async function openTable(tableId) {
  const session = await requestOpenTable(tableId);
  emit("tables:opened", { tableId });
  return session;
}

export {
  TABLE_STATUS, isOccupied, tableNumber, tableLabel, tableLabelById, seatsOf, tableStatusBadge
} from "./tables.model.js";
export { tableCard, tableArt, renderTableGrid, tableDetailHead } from "./tables.view.js";
