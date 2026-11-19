// Interface pública do módulo menu
// Responsável por: itens do cardápio e preços, cadastro de itens.
// Depende de: nenhum módulo.

import { emit } from "../../shared/events.js";
import { fetchMenu, requestCreateItem } from "./menu.api.js";
import { openItemForm } from "./menu.view.js";

export const listMenu = fetchMenu;

export async function createMenuItem(name, price) {
  const item = await requestCreateItem(name, price);
  emit("menu:item-created", { item });
  return item;
}

// Formulário "Adicionar item" já ligado à criação
export const openAddItemForm = () => openItemForm({ save: createMenuItem });

export { renderMenuTable } from "./menu.view.js";
