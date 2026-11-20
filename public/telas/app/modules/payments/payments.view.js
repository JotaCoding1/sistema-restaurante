// payments.view — lista de mesas ocupadas, conta da mesa e confirmação.

import { icon } from "../../shared/icons.js";
import { escape, money, plural, time } from "../../shared/format.js";
import { modal } from "../../shared/dom.js";
import { seatsOf, tableLabel, tableNumber } from "../tables/index.js";
import { lineTotal, orderStatusBadge, orderTotal, ordersOfTable, ordersTotal, statusLabel } from "../orders/index.js";
import { METHODS, blockingOrders, canClose } from "./payments.model.js";

export function renderBillList(el, { tables, orders, selectedId }) {
  el.innerHTML = tables.length ? tables.map((t) => {
    const list = ordersOfTable(orders, t);
    const since = list[0] ? ` · Desde ${time(list[0].createdAt)}` : " · Sem pedidos";
    const selected = t.id === selectedId;
    return `
      <li>
        <button type="button" class="bill-item ${selected ? "is-selected" : ""}" data-table-id="${t.id}" aria-pressed="${selected}">
          <span class="bill-item-text">
            <span class="bill-item-name">${tableLabel(t)}</span>
            <span class="bill-item-meta">${plural(list.length, "pedido", "pedidos")}${since}</span>
          </span>
          <span class="bill-item-total money">${money(ordersTotal(list))}</span>
          ${icon("chevron")}
        </button>
      </li>`;
  }).join("") : `<li class="empty">Nenhuma mesa ocupada no momento.</li>`;
}

function orderBlock(o) {
  return `
    <article class="bill-order card">
      <header class="bill-order-head">
        <div>
          <h3>Pedido #${o.id}</h3>
          <p class="muted">Lançado às ${time(o.createdAt)}</p>
        </div>
        ${orderStatusBadge(o.status)}
      </header>
      <table class="items">
        <thead><tr><th>Item</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${o.items.map((i) => `
            <tr>
              <td>${escape(i.name)}</td>
              <td class="num">${i.quantity}</td>
              <td class="money">${money(i.price)}</td>
              <td class="money">${money(lineTotal(i))}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <footer class="bill-order-foot">
        <span>Subtotal do pedido</span>
        <strong class="money">${money(orderTotal(o))}</strong>
      </footer>
    </article>`;
}

export function renderBill(el, { bill, table, methodKey }) {
  if (!bill) {
    el.innerHTML = `<div class="empty bill-empty">${icon("wallet", "icon--lg")}<p>Selecione uma mesa para abrir a conta.</p></div>`;
    return;
  }
  const pending = blockingOrders(bill);
  const ref = table ?? { id: bill.tableId };

  el.innerHTML = `
    <header class="bill-head">
      <div>
        <h2 class="bill-title">Conta da mesa ${tableNumber(ref)}</h2>
        <p class="bill-meta">${plural(bill.orders.length, "pedido", "pedidos")} · ${seatsOf(ref)} lugares</p>
      </div>
      <span class="status status--busy">Ocupada</span>
    </header>

    <div class="bill-orders">
      ${bill.orders.length ? bill.orders.map(orderBlock).join("") : `<div class="empty">Esta mesa ainda não tem pedidos.</div>`}
    </div>

    ${bill.orders.length ? `
      <div class="bill-summary">
        <ul class="summary-lines">
          ${bill.orders.map((o) => `<li><span>Pedido #${o.id}</span><span class="money">${money(orderTotal(o))}</span></li>`).join("")}
        </ul>
        <div class="grand-total">
          <span>Total da mesa</span>
          <strong class="money">${money(bill.total)}</strong>
        </div>
      </div>

      <fieldset class="pay">
        <legend class="label">Forma de pagamento</legend>
        <div class="pay-grid">
          ${METHODS.map((m) => `
            <label class="pay-option">
              <input type="radio" name="method" value="${m.key}" ${methodKey === m.key ? "checked" : ""} />
              <span class="pay-tile">${icon(m.icon)}<span>${m.label}</span></span>
            </label>`).join("")}
        </div>
      </fieldset>

      ${pending.length ? `
        <p class="bill-warning">
          ${icon("alert", "icon--sm")}
          <span>${plural(pending.length, "pedido ainda não foi entregue", "pedidos ainda não foram entregues")} na mesa
          (${pending.map((o) => `#${o.id} ${statusLabel(o.status).toLowerCase()}`).join(", ")}).
          A conta pode ser fechada quando o garçom confirmar a entrega.</span>
        </p>` : ""}

      <button type="button" class="btn btn--primary btn--lg btn--block" data-pay ${canClose(bill, methodKey) ? "" : "disabled"}>
        Confirmar pagamento e fechar mesa
      </button>` : ""}`;
}

export function showPaymentSuccess({ label, total, methodLabel }) {
  modal(`
    <div class="success">
      <span class="success-icon">${icon("check", "icon--lg")}</span>
      <h2 class="modal-title">Pagamento confirmado</h2>
      <p class="success-text">${escape(label)} foi fechada e já aparece como <strong>Livre</strong> no salão.</p>
      <dl class="success-data">
        <div><dt>Total recebido</dt><dd class="money">${money(total)}</dd></div>
        <div><dt>Forma de pagamento</dt><dd>${escape(methodLabel)}</dd></div>
      </dl>
      <button type="button" class="btn btn--primary btn--lg btn--block" data-close>Concluir</button>
    </div>`);
}
