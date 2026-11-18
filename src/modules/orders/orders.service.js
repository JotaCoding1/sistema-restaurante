import { AppError, requireFields } from "../../shared/erros.js";
import { now } from "../../shared/time.js";
import { getCurrentSession } from "../tables/index.js";
import { getItem } from "../menu/index.js";
import { nextId, readAll, writeAll } from "./orders.repository.js";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("O pedido deve conter ao menos um item", 400);
  }

  return items.map(({ itemId, quantity }) => {
    if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError("Item e quantidade inválidos", 400);
    }

    const item = getItem(itemId);
    return { itemId: item.id, name: item.name, price: item.price, quantity };
  });
}

export function listOrders({ status } = {}) {
  const orders = readAll().orders;
  if (!status) return orders;
  const statuses = Array.isArray(status) ? status : [status];
  return orders.filter((order) => statuses.includes(order.status));
}

export function listOrdersBySession(sessionId) {
  return listOrders().filter((order) => order.sessionId === Number(sessionId));
}

export function getOrder(id) {
  const order = listOrders().find((entry) => entry.id === Number(id));
  if (!order) throw new AppError("Pedido não encontrado", 404);
  return order;
}

export function createOrder({ tableId, items }, user = null) {
  requireFields({ tableId, items }, "tableId", "items");
  const session = getCurrentSession(tableId);
  const data = readAll();
  const order = {
    id: nextId(data.orders),
    tableId: Number(tableId),
    sessionId: session.id,
    items: normalizeItems(items),
    status: ORDER_STATUS.PENDING,
    createdBy: user?.id ?? null,
    createdAt: now()
  };

  data.orders.push(order);
  writeAll(data);
  return order;
}

export function setOrderStatus(id, status) {
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new AppError("Status de pedido inválido", 400);
  }

  const data = readAll();
  const order = data.orders.find((entry) => entry.id === Number(id));
  if (!order) throw new AppError("Pedido não encontrado", 404);

  order.status = status;
  if (status === ORDER_STATUS.DELIVERED) order.deliveredAt = now();
  writeAll(data);
  return order;
}

export function markDelivered(id) {
  const order = getOrder(id);
  if (order.status !== ORDER_STATUS.READY) {
    throw new AppError("Só é possível entregar pedidos prontos", 409);
  }
  return setOrderStatus(order.id, ORDER_STATUS.DELIVERED);
}