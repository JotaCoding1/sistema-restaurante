// menu.view — lista do cardápio e formulário "Adicionar item".

import { icon } from "../../shared/icons.js";
import { escape, money, parseMoney } from "../../shared/format.js";
import { modal } from "../../shared/dom.js";

export function renderMenuTable(el, items) {
  el.innerHTML = `
    <div class="menu-table card">
      <div class="menu-table-head"><span>Item</span><span>Preço</span></div>
      <ul>
        ${items.length
          ? items.map((i) => `
              <li class="menu-line">
                <span>${escape(i.name)}</span>
                <span class="money">${money(i.price)}</span>
              </li>`).join("")
          : `<li class="empty">Nenhum item cadastrado.</li>`}
      </ul>
    </div>`;
}

// Abre o formulário; save(name, price) é a ação do módulo (via index)
export function openItemForm({ save }) {
  const { el, close } = modal(`
    <form novalidate>
      <div class="modal-head">
        <div>
          <p class="eyebrow">Cardápio</p>
          <h2 class="modal-title">Adicionar item</h2>
        </div>
        <button type="button" class="icon-btn" data-close aria-label="Fechar">${icon("x")}</button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label for="itemName">Nome</label>
          <input class="input" id="itemName" name="name" required placeholder="Ex.: Risoto de cogumelos" />
        </div>
        <div class="field">
          <label for="itemPrice">Preço</label>
          <div class="input-wrap price-wrap">
            <span class="price-prefix">R$</span>
            <input class="input num" id="itemPrice" name="price" inputmode="decimal" required placeholder="0,00" />
          </div>
        </div>
        <p class="form-error" data-error hidden></p>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn--ghost" data-close>Cancelar</button>
        <button type="submit" class="btn btn--primary">Salvar item</button>
      </div>
    </form>`);

  const form = el.querySelector("form");
  const error = form.querySelector("[data-error]");
  const showError = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };
  form.elements.name.focus();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const price = parseMoney(form.elements.price.value);
    if (!name) return showError("Informe o nome do item.");
    if (!Number.isFinite(price) || price < 0) return showError("Informe um preço válido.");

    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    try {
      await save(name, Math.round(price * 100) / 100);
      close();
    } catch (err) {
      showError(err.status === 403 ? "Seu perfil não tem permissão para cadastrar itens." : err.message);
      submit.disabled = false;
    }
  });
}
