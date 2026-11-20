// Interface pública do módulo orders
// Responsável por: pedidos das mesas, status, subtotais, novo pedido e entrega.
// Depende de: menu (itens para montar o pedido).

import { emit } from "../../shared/events.js";
import { toast } from "../../shared/dom.js";
import { listMenu } from "../menu/index.js";
import { fetchOrders, requestCreateOrder, requestDeliver } from "./orders.api.js";
import { openOrderBuilder } from "./orders.view.js";

export const listOrders = fetchOrders;

export async function createOrder(tableId, items) {
  const order = await requestCreateOrder(tableId, items);
  emit("orders:created", { order });
  return order;
}

export async function deliverOrder(orderId) {
  const order = await requestDeliver(orderId);
  emit("orders:delivered", { orderId });
  return order;
}

// Abre o modal de novo pedido para uma mesa (busca o cardápio atual)
export async function openNewOrder({ tableId, title }) {
  const menuItems = await listMenu();
  openOrderBuilder({
    title,
    menuItems,
    send: async (items) => {
      try {
        const order = await createOrder(tableId, items);
        toast(`Pedido #${order.id} enviado para a cozinha`);
      } catch (err) {
        toast(err.message, "error");
        throw err;
      }
    }
  });
}

export {
  ORDER_STATUS, statusLabel, orderStatusBadge, lineTotal, orderTotal, ordersTotal,
  ordersOfTable, isDelivered, awaitingDelivery
} from "./orders.model.js";
export { orderCard } from "./orders.view.js";
