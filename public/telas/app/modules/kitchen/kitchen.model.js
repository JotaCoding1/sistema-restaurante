// kitchen.model — organização da fila em três colunas.

export const SENT_LIMIT = 6; // enviados recentes visíveis
export const LATE_MINUTES = 20; // destaque de pedido atrasado

export const LANES = [
  { key: "PENDING",   title: "Pendente",   icon: "clock", empty: "Nenhum pedido aguardando." },
  { key: "PREPARING", title: "Em preparo", icon: "chef",  empty: "Nada no fogo agora." },
  { key: "SENT",      title: "Enviado",    icon: "check", empty: "Nenhum pedido enviado ainda." }
];

const byAge = (a, b) => a.createdAt.localeCompare(b.createdAt);

export function groupIntoLanes(orders) {
  return {
    PENDING: orders.filter((o) => o.status === "PENDING").sort(byAge),
    PREPARING: orders.filter((o) => o.status === "PREPARING").sort(byAge),
    // Aguardando o garçom primeiro; depois os já entregues mais recentes
    SENT: orders
      .filter((o) => o.status === "READY" || o.status === "DELIVERED")
      .sort((a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === "READY" ? -1 : 1))
      .slice(0, SENT_LIMIT)
  };
}
