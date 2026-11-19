// tables.view — cartão de mesa, grade e cabeçalho de detalhes.
// Conteúdo vindo de outros módulos (pedidos, reservas) chega pronto por parâmetro.

import { icon } from "../../shared/icons.js";
import { isOccupied, seatsOf, tableLabel, tableStatusBadge } from "./tables.model.js";

// Mesa vista de cima; pratos aparecem quando ocupada
export function tableArt(busy) {
  return `
    <svg class="table-art" viewBox="0 0 140 116" aria-hidden="true">
      <path d="M54 22V15a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v7"/>
      <path d="M54 94v7a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-7"/>
      <path d="M32 44h-7a4 4 0 0 0-4 4v20a4 4 0 0 0 4 4h7"/>
      <path d="M108 44h7a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4h-7"/>
      <rect class="table-top" x="38" y="28" width="64" height="60" rx="12"/>
      ${busy ? `<circle cx="59" cy="58" r="7.5"/><circle cx="81" cy="58" r="7.5"/>` : ""}
    </svg>`;
}

// detail: texto à direita do rodapé · notes: [{ tone: "reserva"|"ready", icon, text }]
export function tableCard(table, { detail = "Disponível", notes = [], selected = false } = {}) {
  const busy = isOccupied(table);
  return `
    <button type="button" class="table-card ${busy ? "is-busy" : ""} ${selected ? "is-selected" : ""}"
            data-table-id="${table.id}" aria-pressed="${selected}">
      <span class="table-card-head">
        <span class="table-name">${tableLabel(table)}</span>
        ${tableStatusBadge(table)}
      </span>
      ${tableArt(busy)}
      <span class="table-card-meta">
        <span class="seats">${icon("users", "icon--sm")}${seatsOf(table)} lugares</span>
        <span>${detail}</span>
      </span>
      ${notes.map((n) => `<span class="table-card-note is-${n.tone}">${icon(n.icon, "icon--sm")}${n.text}</span>`).join("")}
    </button>`;
}

// Grade de mesas; onSelect(tableId) ao tocar num cartão
export function renderTableGrid(el, tables, { cardOptions = () => ({}), onSelect, emptyText = "Nenhuma mesa." } = {}) {
  el.innerHTML = tables.length
    ? tables.map((t) => tableCard(t, cardOptions(t))).join("")
    : `<div class="empty grid-empty">${emptyText}</div>`;
  if (onSelect && !el.dataset.bound) {
    el.dataset.bound = "1";
    el.addEventListener("click", (e) => {
      const card = e.target.closest("[data-table-id]");
      if (card) onSelect(Number(card.dataset.tableId));
    });
  }
}

export function tableDetailHead(table) {
  return `
    <div class="side-head detail-head">
      <div>
        <h2 class="side-title">${tableLabel(table)}</h2>
        <p class="detail-meta">${icon("users", "icon--sm")}${seatsOf(table)} lugares</p>
      </div>
      ${tableStatusBadge(table)}
    </div>`;
}
