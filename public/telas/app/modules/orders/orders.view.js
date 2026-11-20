// orders.view — cartão de pedido e montagem de novo pedido.

import { icon } from "../../shared/icons.js";
import { escape, money, time } from "../../shared/format.js";
import { modal } from "../../shared/dom.js";
import { lineTotal, orderStatusBadge, orderTotal } from "./orders.model.js";

// Cartão de pedido (detalhes da mesa no salão)
export function orderCard(order, { deliverable = false } = {}) {
  return `
    <article class="order-card card">
      <header class="order-card-head">
        <div>
          <p class="order-card-title">Pedido #${order.id}</p>
          <p class="muted">Lançado às ${time(order.createdAt)}</p>
        </div>
        ${orderStatusBadge(order.status)}
      </header>
      <ul class="order-items">
        ${order.items.map((i) => `
          <li><span class="qty">${i.quantity}×</span><span class="grow">${escape(i.name)}</span><span class="money muted">${money(lineTotal(i))}</span></li>`).join("")}
      </ul>
      <footer class="order-card-foot">
        <span>Subtotal do pedido</span>
        <strong class="money">${money(orderTotal(order))}</strong>
      </footer>
      ${deliverable ? `
        <button type="button" class="btn btn--secondary btn--block deliver" data-deliver="${order.id}">
          ${icon("check")}Confirmar entrega na mesa
        </button>` : ""}
    </article>`;
}

// Modal de novo pedido. menuItems vem do módulo menu; send(items) cria o pedido.
export function openOrderBuilder({ title, menuItems, send }) {
  const cart = new Map(); // itemId → quantidade

  const { el, close } = modal(`
    <div class="modal-head">
      <div>
        <p class="eyebrow">${escape(title)} · Novo pedido</p>
        <h2 class="modal-title">O que vai para a mesa?</h2>
      </div>
      <button type="button" class="icon-btn" data-close aria-label="Fechar">${icon("x")}</button>
    </div>
    <div class="order-builder">
      <section class="menu-pick" aria-label="Cardápio">
        <p class="label">Cardápio</p>
        <ul class="menu-list" data-menu></ul>
      </section>
      <section class="cart" aria-label="Itens do pedido">
        <p class="label">Itens do pedido</p>
        <div data-lines></div>
        <div class="cart-total">
          <span>Subtotal</span>
          <strong class="money" data-total>${money(0)}</strong>
        </div>
        <button type="button" class="btn btn--primary btn--lg btn--block" data-send disabled>
          ${icon("send")}Enviar para a cozinha
        </button>
      </section>
    </div>`, { wide: true });

  const menuEl = el.querySelector("[data-menu]");
  const linesEl = el.querySelector("[data-lines]");
  const totalEl = el.querySelector("[data-total]");
  const sendBtn = el.querySelector("[data-send]");

  function draw() {
    menuEl.innerHTML = menuItems.length ? menuItems.map((item) => {
      const q = cart.get(item.id) ?? 0;
      return `
        <li class="menu-row ${q ? "is-picked" : ""}">
          <div class="menu-row-info">
            <span class="menu-row-name">${escape(item.name)}</span>
            <span class="money muted">${money(item.price)}</span>
          </div>
          <div class="stepper">
            <button type="button" class="icon-btn" data-dec="${item.id}" ${q ? "" : "disabled"} aria-label="Diminuir ${escape(item.name)}">${icon("minus")}</button>
            <span class="stepper-value num">${q}</span>
            <button type="button" class="icon-btn" data-inc="${item.id}" aria-label="Adicionar ${escape(item.name)}">${icon("plus")}</button>
          </div>
        </li>`;
    }).join("") : `<li class="empty">O cardápio está vazio.</li>`;

    const picked = menuItems.filter((i) => cart.get(i.id));
    const total = picked.reduce((s, i) => s + i.price * cart.get(i.id), 0);
    linesEl.innerHTML = picked.length
      ? `<ul class="cart-list">${picked.map((i) => `
          <li><span class="qty">${cart.get(i.id)}×</span><span class="grow">${escape(i.name)}</span><span class="money">${money(i.price * cart.get(i.id))}</span></li>`).join("")}</ul>`
      : `<p class="cart-empty">Escolha os itens no cardápio e ajuste as quantidades.</p>`;
    totalEl.textContent = money(total);
    sendBtn.disabled = picked.length === 0;
  }

  el.addEventListener("click", async (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) {
      const id = Number(inc.dataset.inc);
      cart.set(id, (cart.get(id) ?? 0) + 1);
      return draw();
    }
    if (dec) {
      const id = Number(dec.dataset.dec);
      const q = (cart.get(id) ?? 0) - 1;
      q > 0 ? cart.set(id, q) : cart.delete(id);
      return draw();
    }
    if (e.target.closest("[data-send]")) {
      sendBtn.disabled = true;
      try {
        await send([...cart].map(([itemId, quantity]) => ({ itemId, quantity })));
        close();
      } catch {
        sendBtn.disabled = false;
      }
    }
  });

  draw();
}
