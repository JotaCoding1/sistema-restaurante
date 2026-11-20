// Página da Cozinha — composição: identity, kitchen, menu.

import { $, poll, toast } from "../shared/dom.js";
import { on } from "../shared/events.js";
import { icon } from "../shared/icons.js";
import { plural } from "../shared/format.js";
import { mountHero } from "../shared/layout.js";

import { requireRole, mountUserTopbar } from "../modules/identity/index.js";
import { mountKitchenBoard } from "../modules/kitchen/index.js";
import { listMenu, renderMenuTable, openAddItemForm } from "../modules/menu/index.js";

const user = requireRole("COOK");
if (user) start();

function start() {
  mountUserTopbar(user);
  mountHero($("#hero"), {
    area: "Cozinha",
    title: "O próximo prato começa aqui.",
    subtitle: "Cuidado no preparo. Sintonia com o salão."
  });

  let view = "orders";
  const tabOrders = $("#tabOrders");
  const tabMenu = $("#tabMenu");
  tabOrders.innerHTML = `${icon("chef")}Pedidos`;
  tabMenu.innerHTML = `${icon("utensils")}Cardápio`;
  $("#addItem").innerHTML = `${icon("plus")}Adicionar item`;

  async function load() {
    try {
      if (view === "orders") {
        await mountKitchenBoard($("#board"));
      } else {
        const items = await listMenu();
        $("#menuCount").textContent = plural(items.length, "item", "itens");
        renderMenuTable($("#menuTable"), items);
      }
    } catch (err) {
      toast(err.message, "error");
    }
  }

  function setView(next) {
    view = next;
    tabOrders.setAttribute("aria-selected", view === "orders");
    tabMenu.setAttribute("aria-selected", view === "menu");
    $("#viewOrders").hidden = view !== "orders";
    $("#viewMenu").hidden = view !== "menu";
    load();
  }

  tabOrders.addEventListener("click", () => setView("orders"));
  tabMenu.addEventListener("click", () => setView("menu"));
  $("#addItem").addEventListener("click", openAddItemForm);

  on("kitchen:started", load);
  on("kitchen:ready", load);
  on("menu:item-created", ({ item }) => {
    toast(`${item.name} adicionado ao cardápio`);
    load();
  });

  load();
  poll(load);
}
