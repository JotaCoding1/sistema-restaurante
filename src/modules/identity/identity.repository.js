import { createStore } from "../../shared/jsonStore.js";

const store = createStore("identity", { users: [] });

export const readAll = () => store.read();
export const writeAll = (data) => store.write(data);

export const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1;