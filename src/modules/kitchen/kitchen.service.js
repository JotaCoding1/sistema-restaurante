import { AppError } from "../../shared/errors.js";
import { now } from "../../shared/time.js";
import { ORDER_STATUS, getOrder, listOrders, setOrderStatus } from "../orders/index.js";
import { readTickets, writeTickets } from "./kitchen.repository.js";

const { PENDING, PREPARING, READY } = ORDER_STATUS;

// Fila da cozinha: pedidos aguardando ou em preparo, os mais antigos primeiro
export function getQueue() {
  return [...listOrders({ status: [PENDING, PREPARING] })].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

export function startPreparing(orderId) {
  const order = getOrder(orderId);
  if (order.status !== PENDING) throw new AppError("Só é possível iniciar pedidos pendentes", 409);

  const updated = setOrderStatus(order.id, PREPARING);
  const tickets = readTickets();
  tickets.push({ orderId: order.id, startedAt: now(), readyAt: null });
  writeTickets(tickets);
  return updated;
}

export function markReady(orderId) {
  const order = getOrder(orderId);
  if (order.status !== PREPARING) throw new AppError("Só é possível finalizar pedidos em preparo", 409);

  const updated = setOrderStatus(order.id, READY);
  const tickets = readTickets();
  const ticket = tickets.find((t) => t.orderId === order.id && !t.readyAt);
  if (ticket) ticket.readyAt = now();
  writeTickets(tickets);
  return updated;
}
