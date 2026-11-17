import { createStore } from "../../shared/jsonStore.js";

const store = createStore("payments", { payments: [] });

export const readPayments = () => store.read().payments;
export const writePayments = (payments) => store.write({ payments });
