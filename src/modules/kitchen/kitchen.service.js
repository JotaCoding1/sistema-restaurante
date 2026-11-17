import { AppError } from "../../shared/erros.js";
import { now } from "../../shared/time.js";
import { listOrders, setOrderStatus } from "../orders/index.js";
import { readTickets, writeTickets } from "./kitchen.repository.js";

const PENDING = "PENDING";
const PREPARING = "PREPARING";
const READY = "READY";

// Fila da cozinha: pedidos aguardando ou em preparo, os mais antigos primeiro
export function getQueue() {
  return [...listOrders({ status: [PENDING, PREPARING] })].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

function getOrderOrFail(orderId) {
  const order = listOrders({}).find((o) => o.id === Number(orderId));
  if (!order) throw new AppError("Pedido não encontrado", 404);
  return order;
}

export function startPreparing(orderId) {
  const order = getOrderOrFail(orderId);
  if (order.status !== PENDING) throw new AppError("Só é possível iniciar pedidos pendentes", 409);

  const updated = setOrderStatus(order.id, PREPARING);
  const tickets = readTickets();
  tickets.push({ orderId: order.id, startedAt: now(), readyAt: null });
  writeTickets(tickets);
  return updated;
}

export function markReady(orderId) {
  const order = getOrderOrFail(orderId);
  if (order.status !== PREPARING) throw new AppError("Só é possível finalizar pedidos em preparo", 409);

  const updated = setOrderStatus(order.id, READY);
  const tickets = readTickets();
  const ticket = tickets.find((t) => t.orderId === order.id && !t.readyAt);
  if (ticket) ticket.readyAt = now();
  writeTickets(tickets);
  return updated;
}
