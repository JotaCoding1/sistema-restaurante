import { AppError, requireFields } from "../../shared/erros.js";
import { now } from "../../shared/time.js";
import { readAll, writeAll, nextId } from "./tables.repository.js";

export const TABLE_STATUS = { FREE: "FREE", OCCUPIED: "OCCUPIED" };

export function listTables() {
  return readAll().tables;
}

export function getTable(id) {
  const table = readAll().tables.find((t) => t.id === Number(id));
  if (!table) throw new AppError("Mesa não encontrada", 404);
  return table;
}

export function createTable({ name }) {
  requireFields({ name }, "name");
  const data = readAll();
  const table = { id: nextId(data.tables), name, status: TABLE_STATUS.FREE, currentSessionId: null };
  data.tables.push(table);
  writeAll(data);
  return table;
}

export function openTable(id, openedBy = null) {
  const data = readAll();
  const table = data.tables.find((t) => t.id === Number(id));
  if (!table) throw new AppError("Mesa não encontrada", 404);
  if (table.status === TABLE_STATUS.OCCUPIED) throw new AppError("Mesa já está ocupada", 409);

  const session = { id: nextId(data.sessions), tableId: table.id, openedBy, openedAt: now(), closedAt: null };
  data.sessions.push(session);
  table.status = TABLE_STATUS.OCCUPIED;
  table.currentSessionId = session.id;
  writeAll(data);
  return session;
}

// Sessão de atendimento em andamento da mesa (409 se a mesa estiver livre)
export function getCurrentSession(tableId) {
  const data = readAll();
  const table = data.tables.find((t) => t.id === Number(tableId));
  if (!table) throw new AppError("Mesa não encontrada", 404);
  const session = data.sessions.find((s) => s.id === table.currentSessionId);
  if (!session) throw new AppError("Mesa não está aberta", 409);
  return session;
}

export function closeTable(id) {
  const data = readAll();
  const table = data.tables.find((t) => t.id === Number(id));
  if (!table) throw new AppError("Mesa não encontrada", 404);
  const session = data.sessions.find((s) => s.id === table.currentSessionId);
  if (!session) throw new AppError("Mesa não está aberta", 409);

  session.closedAt = now();
  table.status = TABLE_STATUS.FREE;
  table.currentSessionId = null;
  writeAll(data);
  return session;
}
