// kitchen.view — quadro Pendente / Em preparo / Enviado e comandas.

import { icon } from "../../shared/icons.js";
import { escape, minutesSince, time } from "../../shared/format.js";
import { tableLabelById } from "../tables/index.js";
import { LANES, LATE_MINUTES, groupIntoLanes } from "./kitchen.model.js";

function ticket(order, tables) {
  const sent = order.status === "READY" || order.status === "DELIVERED";
  const waited = minutesSince(order.createdAt);
  const late = !sent && waited >= LATE_MINUTES;

  let foot;
  if (order.status === "PENDING") {
    foot = `<button type="button" class="btn btn--secondary btn--block btn--ticket" data-start="${order.id}">${icon("chef")}Iniciar preparo</button>`;
  } else if (order.status === "PREPARING") {
    foot = `<button type="button" class="btn btn--primary btn--block btn--ticket" data-ready="${order.id}">${icon("send")}Marcar como enviado</button>`;
  } else {
    foot = `<p class="ticket-sent">${icon("check", "icon--sm")}${order.status === "READY" ? "Enviado ao salão" : "Entregue na mesa"}</p>`;
  }

  return `
    <article class="ticket card ${sent ? "is-sent" : ""}">
      <header class="ticket-head">
        <div>
          <h3 class="ticket-table">${tableLabelById(tables, order.tableId)}</h3>
          <p class="ticket-order">Pedido #${order.id}</p>
        </div>
        <span class="ticket-time num ${late ? "is-late" : ""}" title="${late ? `Aguardando há ${waited} min` : ""}">
          ${icon("clock", "icon--sm")}${time(order.createdAt)}
        </span>
      </header>
      <ul class="ticket-items">
        ${order.items.map((i) => `<li><span class="ticket-qty num">${i.quantity}×</span>${escape(i.name)}</li>`).join("")}
      </ul>
      ${foot}
    </article>`;
}

// Desenha o quadro. onStart/onReady(orderId) são as ações do módulo.
export function renderBoard(el, { orders, tables, onStart, onReady }) {
  const lanes = groupIntoLanes(orders);
  el.innerHTML = `
    <div class="board">
      ${LANES.map((lane) => `
        <div class="lane" data-lane="${lane.key}">
          <header class="lane-head">
            <h2>${icon(lane.icon)}${lane.title}</h2>
            <span class="lane-count num">${lanes[lane.key].length}</span>
          </header>
          <div class="lane-body">
            ${lanes[lane.key].length
              ? lanes[lane.key].map((o) => ticket(o, tables)).join("")
              : `<div class="empty">${lane.empty}</div>`}
          </div>
        </div>`).join("")}
    </div>`;

  if (!el.dataset.bound) {
    el.dataset.bound = "1";
    el.addEventListener("click", (e) => {
      const start = e.target.closest("[data-start]");
      const ready = e.target.closest("[data-ready]");
      if (start) el._onStart?.(Number(start.dataset.start), start);
      if (ready) el._onReady?.(Number(ready.dataset.ready), ready);
    });
  }
  el._onStart = onStart;
  el._onReady = onReady;
}
