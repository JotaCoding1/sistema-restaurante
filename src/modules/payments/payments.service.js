import { AppError, requireFields } from "../../shared/erros.js";
import { now } from "../../shared/time.js";
import { listOrdersBySession } from "../orders/index.js";
import { getTable, getCurrentSession, closeTable } from "../tables/index.js";
import { readPayments, writePayments } from "./payments.repository.js";

const METHODS = ["CASH", "CARD", "PIX"];
const round = (n) => Math.round(n * 100) / 100;

// Conta da mesa: pedidos da sessão atual e total
export function getBill(tableId) {
  const table = getTable(tableId);
  const session = getCurrentSession(table.id);
  const orders = listOrdersBySession(session.id).filter((o) => o.status !== "CANCELLED");
  const total = round(
    orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0)
  );
  return { tableId: table.id, tableName: table.name, sessionId: session.id, orders, total };
}

export function pay(tableId, { method }, user) {
  requireFields({ method }, "method");
  if (!METHODS.includes(method)) throw new AppError(`Forma de pagamento inválida: ${METHODS.join(", ")}`, 400);

  const bill = getBill(tableId);
  if (bill.orders.length === 0) throw new AppError("Mesa não possui pedidos", 409);
  if (bill.orders.some((o) => o.status !== "DELIVERED")) {
    throw new AppError("Há pedidos ainda não entregues", 409);
  }

  const payments = readPayments();
  const payment = {
    id: payments.reduce((max, p) => Math.max(max, p.id), 0) + 1,
    tableId: bill.tableId,
    sessionId: bill.sessionId,
    total: bill.total,
    method,
    receivedBy: user?.id ?? null,
    paidAt: now()
  };
  payments.push(payment);
  writePayments(payments);

  closeTable(bill.tableId);
  return payment;
}

export const listPayments = () => readPayments();
