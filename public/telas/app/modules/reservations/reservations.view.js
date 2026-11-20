// reservations.view — lista "Reservas do dia" e aviso de reserva da mesa.

import { icon } from "../../shared/icons.js";
import { escape, plural } from "../../shared/format.js";
import { tableLabelById } from "../tables/index.js";
import { hourLabel, isUpcoming } from "./reservations.model.js";

export function renderReservationList(el, reservations, tables) {
  el.innerHTML = `
    <div class="side-head">
      <h2 class="side-title">Reservas do dia</h2>
      ${icon("calendar")}
    </div>
    <ul class="reserva-list">
      ${reservations.map((r) => `
        <li class="reserva ${isUpcoming(r) ? "" : "is-past"}">
          <div class="reserva-top">
            <span class="reserva-time num">${icon("clock")}${r.time}</span>
            <span class="chip">${tableLabelById(tables, r.tableId)}</span>
          </div>
          <p class="reserva-name">${escape(r.name)}</p>
          <p class="reserva-people">${icon("users", "icon--sm")}${plural(r.people, "pessoa", "pessoas")}${isUpcoming(r) ? "" : " · concluída"}</p>
        </li>`).join("")}
    </ul>`;
}

// Nota para o cartão da mesa (formato aceito por tables.tableCard)
export const reservationNote = (r) => ({ tone: "reserva", icon: "clock", text: `Reserva às ${hourLabel(r.time)}` });

// Destaque nos detalhes de uma mesa livre
export function reservationCallout(r) {
  return `
    <div class="note">
      <span class="note-icon">${icon("clock")}</span>
      <div>
        <p class="note-title">Reserva às ${hourLabel(r.time)}</p>
        <p class="muted">${escape(r.name)} · ${plural(r.people, "pessoa", "pessoas")}</p>
      </div>
    </div>`;
}
