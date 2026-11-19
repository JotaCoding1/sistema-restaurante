// shared/dom — peças de interface genéricas: aviso, modal, atualização periódica.

import { icon } from "./icons.js";

export const $ = (selector, root = document) => root.querySelector(selector);

// Aviso temporário no rodapé
export function toast(message, type = "ok") {
  let wrap = $(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    wrap.setAttribute("role", "status");
    document.body.append(wrap);
  }
  const el = document.createElement("div");
  el.className = `toast${type === "error" ? " toast--error" : ""}`;
  el.innerHTML = `${icon(type === "error" ? "alert" : "checkCircle", "icon--sm")}<span></span>`;
  el.querySelector("span").textContent = message;
  wrap.append(el);
  setTimeout(() => el.remove(), 3400);
}

// Modal. Fecha com Esc, clique fora ou em [data-close]. Retorna { el, close }.
export function modal(html, { wide = false, onClose } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `<div class="modal${wide ? " modal--wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
  const onKey = (e) => e.key === "Escape" && close();
  function close() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    onClose?.();
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  return { el: overlay.querySelector(".modal"), close };
}

// Executa fn a cada `ms` enquanto a aba estiver visível (sincroniza os perfis)
export function poll(fn, ms = 5000) {
  let timer = setInterval(fn, ms);
  document.addEventListener("visibilitychange", () => {
    clearInterval(timer);
    if (!document.hidden) {
      fn();
      timer = setInterval(fn, ms);
    }
  });
}

// Desativa o botão enquanto a ação roda; mostra o erro em aviso
export async function withBusy(button, action) {
  if (button) button.disabled = true;
  try {
    return await action();
  } catch (err) {
    toast(err.message, "error");
    if (button) button.disabled = false;
    return undefined;
  }
}
