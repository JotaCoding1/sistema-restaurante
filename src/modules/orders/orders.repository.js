import { createStore } from "../../shared/jsonStore.js";

const store = createStore("orders", { orders: [] });

export const readAll = () => store.read();
export const writeAll = (data) => store.write(data);
export const nextId = (list) => list.reduce((max, order) => Math.max(max, order.id), 0) + 1;