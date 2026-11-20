// orders.api — único ponto do front que chama /api/orders.

import { get, post } from "../../shared/http.js";

export const fetchOrders = () => get("/orders");
// items: [{ itemId, quantity }]
export const requestCreateOrder = (tableId, items) => post("/orders", { tableId, items });
export const requestDeliver = (orderId) => post(`/orders/${orderId}/deliver`);
