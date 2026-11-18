import { AppError, requireFields } from "../../shared/erros.js";
import { nextId, readAll, writeAll } from "./menu.repository.js";

function validatePrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    throw new AppError("Preço deve ser um número maior ou igual a zero", 400);
  }
}

export function listItems() {
  return readAll().items;
}

export function getItem(id) {
  const item = readAll().items.find((entry) => entry.id === Number(id));
  if (!item) throw new AppError("Item não encontrado", 404);
  return item;
}

export function createItem({ name, price }) {
  requireFields({ name, price }, "name", "price");
  if (typeof name !== "string" || !name.trim()) {
    throw new AppError("Nome deve ser um texto não vazio", 400);
  }
  validatePrice(price);

  const data = readAll();
  const item = { id: nextId(data.items), name: name.trim(), price };
  data.items.push(item);
  writeAll(data);
  return item;
}