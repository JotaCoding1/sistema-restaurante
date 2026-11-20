// orders.model — status, totais e filtros de pedidos.

export const ORDER_STATUS = {
  PENDING:   { key: "PENDING",   label: "Pendente",   css: "pending" },
  PREPARING: { key: "PREPARING", label: "Em preparo", css: "preparing" },
  READY:     { key: "READY",     label: "Enviado",    css: "ready" },
  DELIVERED: { key: "DELIVERED", label: "Entregue",   css: "delivered" },
  CANCELLED: { key: "CANCELLED", label: "Cancelado",  css: "pending" }
};

export const statusLabel = (status) => (ORDER_STATUS[status] ?? ORDER_STATUS.PENDING).label;

export function orderStatusBadge(status) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.PENDING;
  return `<span class="status status--${s.css}">${s.label}</span>`;
}

export const lineTotal = (item) => item.price * item.quantity;
export const orderTotal = (order) => order.items.reduce((s, i) => s + lineTotal(i), 0);
export const ordersTotal = (orders) => orders.reduce((s, o) => s + orderTotal(o), 0);

const byCreation = (a, b) => a.createdAt.localeCompare(b.createdAt);

// Pedidos ativos (não cancelados) da sessão atual da mesa, do mais antigo ao mais novo
export function ordersOfTable(orders, table) {
  if (!table?.currentSessionId) return [];
  return orders
    .filter((o) => o.sessionId === table.currentSessionId && o.status !== "CANCELLED")
    .sort(byCreation);
}

export const isDelivered = (order) => order.status === "DELIVERED";
export const awaitingDelivery = (order) => order.status === "READY";
