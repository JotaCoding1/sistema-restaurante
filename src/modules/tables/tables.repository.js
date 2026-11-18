import { createStore } from "../../shared/jsonStore.js";

const store = createStore("tables", { tables: [], sessions: [] });

export const readAll = () => store.read();
export const writeAll = (data) => store.write(data);

export const nextId = (list) => list.reduce((max, x) => Math.max(max, x.id), 0) + 1;
