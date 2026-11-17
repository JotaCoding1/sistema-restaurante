import { createStore } from "../../shared/jsonStore.js";

// Registro dos tempos de preparo: { orderId, startedAt, readyAt }
const store = createStore("kitchen", { tickets: [] });

export const readTickets = () => store.read().tickets;
export const writeTickets = (tickets) => store.write({ tickets });
