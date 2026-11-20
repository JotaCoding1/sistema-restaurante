// Interface pública do módulo kitchen
// Responsável por: fila de preparo e avanço Pendente → Em preparo → Enviado.
// Depende de: orders (pedidos), tables (rótulo da mesa).

import { emit } from "../../shared/events.js";
import { toast, withBusy } from "../../shared/dom.js";
import { listOrders } from "../orders/index.js";
import { listTables } from "../tables/index.js";
import { requestReady, requestStart } from "./kitchen.api.js";
import { renderBoard } from "./kitchen.view.js";

export async function startPreparing(orderId) {
  const order = await requestStart(orderId);
  emit("kitchen:started", { orderId });
  return order;
}

export async function markAsSent(orderId) {
  const order = await requestReady(orderId);
  emit("kitchen:ready", { orderId });
  return order;
}

// Carrega pedidos e mesas e desenha o quadro com as ações ligadas
export async function mountKitchenBoard(el) {
  const [orders, tables] = await Promise.all([listOrders(), listTables()]);
  renderBoard(el, {
    orders,
    tables,
    onStart: (id, btn) => withBusy(btn, async () => {
      await startPreparing(id);
      toast(`Pedido #${id} em preparo`);
    }),
    onReady: (id, btn) => withBusy(btn, async () => {
      await markAsSent(id);
      toast(`Pedido #${id} enviado ao salão`);
    })
  });
}

export { LANES, groupIntoLanes } from "./kitchen.model.js";
