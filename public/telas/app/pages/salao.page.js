// Página do Salão (garçom) — composição: identity, tables, reservations, orders.
// A página guarda o estado da tela e liga os módulos; regras ficam nos módulos.

import { $, poll, toast, withBusy } from "../shared/dom.js";
import { on } from "../shared/events.js";
import { icon } from "../shared/icons.js";
import { money, pad2, plural } from "../shared/format.js";
import { mountHero } from "../shared/layout.js";

import { requireRole, mountUserTopbar } from "../modules/identity/index.js";
import { listTables, openTable, isOccupied, renderTableGrid, tableDetailHead, tableLabel } from "../modules/tables/index.js";
import { listReservations, nextReservationFor, renderReservationList, reservationNote, reservationCallout } from "../modules/reservations/index.js";
import { listOrders, ordersOfTable, ordersTotal, orderCard, awaitingDelivery, deliverOrder, openNewOrder } from "../modules/orders/index.js";

const user = requireRole("WAITER");
if (user) start();

function start() {
  mountUserTopbar(user);
  mountHero($("#hero"), {
    area: "Salão",
    title: "Tudo pronto para receber.",
    subtitle: "Cada mesa, cada pedido, no seu tempo."
  });

  const state = { tables: [], orders: [], reservations: [], selectedId: null, filter: "ALL" };
  const grid = $("#tableGrid");
  const side = $("#side");

  async function load() {
    try {
      [state.tables, state.orders, state.reservations] = await Promise.all([
        listTables(), listOrders(), listReservations()
      ]);
      render();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  // ---------- Render ----------

  function render() {
    renderStats();
    renderGrid();
    renderSide();
  }

  function renderStats() {
    const busy = state.tables.filter(isOccupied).length;
    const stats = [
      { icon: "grid",     value: state.tables.length,        label: "Mesas no salão" },
      { icon: "check",    value: state.tables.length - busy, label: "Mesas livres" },
      { icon: "utensils", value: busy,                       label: "Mesas ocupadas" },
      { icon: "calendar", value: state.reservations.length,  label: "Reservas hoje" }
    ];
    $("#stats").innerHTML = stats.map((s) => `
      <div class="stat">
        <span class="stat-icon">${icon(s.icon)}</span>
        <div>
          <p class="stat-value num">${pad2(s.value)}</p>
          <p class="stat-label">${s.label}</p>
        </div>
      </div>`).join("");
  }

  function renderGrid() {
    const visible = state.tables.filter((t) =>
      state.filter === "ALL" ? true : state.filter === "OCCUPIED" ? isOccupied(t) : !isOccupied(t)
    );
    $("#tablesCount").textContent = plural(state.tables.length, "mesa", "mesas");

    renderTableGrid(grid, visible, {
      emptyText: "Nenhuma mesa neste filtro.",
      onSelect: (id) => {
        state.selectedId = state.selectedId === id ? null : id;
        render();
        if (state.selectedId && window.innerWidth <= 1180) side.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      cardOptions: (t) => {
        const orders = ordersOfTable(state.orders, t);
        const notes = [];
        let detail = "Disponível";
        if (isOccupied(t)) {
          detail = orders.length
            ? `${plural(orders.length, "pedido", "pedidos")} · <span class="money">${money(ordersTotal(orders))}</span>`
            : "Sem pedidos";
          const ready = orders.filter(awaitingDelivery).length;
          if (ready) notes.push({ tone: "ready", icon: "send", text: `${plural(ready, "pedido enviado", "pedidos enviados")} pela cozinha` });
        } else {
          const r = nextReservationFor(state.reservations, t.id);
          if (r) notes.push(reservationNote(r));
        }
        return { detail, notes, selected: state.selectedId === t.id };
      }
    });
  }

  function renderSide() {
    const table = state.tables.find((t) => t.id === state.selectedId);
    if (!table) return renderReservationList(side, state.reservations, state.tables);

    const back = `<button type="button" class="btn btn--ghost back" data-back>${icon("arrowLeft", "icon--sm")}Reservas do dia</button>`;

    if (!isOccupied(table)) {
      const r = nextReservationFor(state.reservations, table.id);
      side.innerHTML = `
        ${back}
        ${tableDetailHead(table)}
        ${r ? reservationCallout(r) : ""}
        <p class="free-text">Mesa livre. Abra a mesa para começar a lançar os pedidos.</p>
        <button type="button" class="btn btn--primary btn--lg btn--block" data-open>Abrir mesa</button>`;
      return;
    }

    const orders = ordersOfTable(state.orders, table);
    side.innerHTML = `
      ${back}
      ${tableDetailHead(table)}
      <div class="detail-sub">
        <span class="label">Pedidos lançados</span>
        <span class="muted">${orders.length}</span>
      </div>
      <div class="order-stack">
        ${orders.length ? orders.map((o) => orderCard(o, { deliverable: awaitingDelivery(o) })).join("") : `<div class="empty">Nenhum pedido lançado ainda.</div>`}
      </div>
      ${orders.length ? `
        <div class="running-total">
          <span>Total parcial da mesa</span>
          <strong class="money">${money(ordersTotal(orders))}</strong>
        </div>` : ""}
      <button type="button" class="btn btn--primary btn--lg btn--block" data-new-order>${icon("plus")}Novo pedido</button>`;
  }

  // ---------- Ações (delegam aos módulos) ----------

  $("#filter").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.filter = btn.dataset.filter;
    e.currentTarget.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    renderGrid();
  });

  side.addEventListener("click", (e) => {
    const table = state.tables.find((t) => t.id === state.selectedId);
    if (e.target.closest("[data-back]")) {
      state.selectedId = null;
      return render();
    }
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      return withBusy(openBtn, async () => {
        await openTable(table.id);
        toast(`${tableLabel(table)} aberta`);
      });
    }
    const deliverBtn = e.target.closest("[data-deliver]");
    if (deliverBtn) {
      return withBusy(deliverBtn, async () => {
        await deliverOrder(Number(deliverBtn.dataset.deliver));
        toast(`Pedido #${deliverBtn.dataset.deliver} entregue na mesa`);
      });
    }
    if (e.target.closest("[data-new-order]")) {
      openNewOrder({ tableId: table.id, title: tableLabel(table) }).catch((err) => toast(err.message, "error"));
    }
  });

  // Eventos dos módulos → recarrega a tela
  ["tables:opened", "orders:created", "orders:delivered"].forEach((ev) => on(ev, load));

  load();
  poll(load);
}
