// payments.model — formas de pagamento e regra de fechamento.

// Débito e crédito são registrados como CARD na API.
export const METHODS = [
  { key: "pix",    label: "Pix",               icon: "pix",  api: "PIX" },
  { key: "cash",   label: "Dinheiro",          icon: "cash", api: "CASH" },
  { key: "debit",  label: "Cartão de débito",  icon: "card", api: "CARD" },
  { key: "credit", label: "Cartão de crédito", icon: "card", api: "CARD" }
];

export const methodByKey = (key) => METHODS.find((m) => m.key === key) ?? null;

// Pedidos que ainda impedem o fechamento (o back-end exige todos entregues)
export const blockingOrders = (bill) => bill.orders.filter((o) => o.status !== "DELIVERED");

export const canClose = (bill, methodKey) =>
  bill.orders.length > 0 && blockingOrders(bill).length === 0 && Boolean(methodByKey(methodKey));
