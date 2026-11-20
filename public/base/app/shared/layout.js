// shared/layout — estrutura visual comum: marca, topo e cabeçalho de página.
// Recebe tudo por parâmetro (nome, áreas, ação de sair); não conhece módulos.

import { icon } from "./icons.js";
import { escape, longDate, serviceName } from "./format.js";

export function brand() {
  return `
    <div class="brand">
      <span class="brand-mark">${icon("utensils")}</span>
      <span class="brand-text">
        <span class="brand-name">à mesa</span>
        <span class="brand-sub">Gestão de restaurante</span>
      </span>
    </div>`;
}

// areas: [{ label, icon, active, hint, onSelect }]
export function mountTopbar({ userName, roleLabel, areas = [], onLogout }) {
  const initials = userName.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const bar = document.createElement("header");
  bar.className = "topbar";
  bar.innerHTML = `
    ${brand()}
    <nav class="nav" aria-label="Áreas">
      ${areas.map((a) => `
        <button type="button" class="nav-item ${a.active ? "is-active" : ""}" aria-label="${escape(a.label)}" ${a.active ? 'aria-current="page"' : `title="${escape(a.hint ?? "")}"`}>
          ${icon(a.icon)}<span>${escape(a.label)}</span>
        </button>`).join("")}
    </nav>
    <div class="topbar-spacer"></div>
    <div class="user">
      <span class="avatar" aria-hidden="true">${escape(initials)}</span>
      <span class="user-text">
        <span class="user-name">${escape(userName)}</span>
        <span class="user-role">${escape(roleLabel)}</span>
      </span>
      <button class="logout" type="button" aria-label="Sair">${icon("logout")}</button>
    </div>`;
  bar.querySelector(".logout").addEventListener("click", () => onLogout?.());
  bar.querySelectorAll(".nav-item").forEach((button, index) => {
    button.addEventListener("click", () => areas[index].onSelect?.());
  });
  document.body.prepend(bar);
  return {
    setBusy(busy) {
      bar.setAttribute("aria-busy", String(busy));
      bar.querySelectorAll("button").forEach((button) => { button.disabled = busy; });
    }
  };
}

// Cabeçalho: área · serviço, frase, subtítulo, data e hora (atualiza sozinho)
export function mountHero(el, { area, title, subtitle }) {
  el.classList.add("hero");
  el.innerHTML = `
    <p class="eyebrow">${escape(area)} · <span data-service></span></p>
    <h1 class="hero-title">${escape(title)}</h1>
    <div class="clock">
      <span class="clock-date">${icon("calendar")}<span data-date></span></span>
      <span class="clock-sep" aria-hidden="true"></span>
      <span class="num" data-time></span>
    </div>
    <p class="hero-sub">${escape(subtitle)}</p>`;
  const tick = () => {
    const now = new Date();
    el.querySelector("[data-service]").textContent = serviceName(now);
    el.querySelector("[data-date]").textContent = longDate(now);
    el.querySelector("[data-time]").textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  tick();
  setInterval(tick, 20000);
}
