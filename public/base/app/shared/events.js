// shared/events — barramento de eventos da página.
// Módulos avisam o que aconteceu (emit) sem conhecer quem reage;
// as páginas (composição) escutam (on) e decidem o que recarregar.
//
// Eventos publicados pelos módulos:
//   tables:opened        { tableId }
//   orders:created       { order }
//   orders:delivered     { orderId }
//   kitchen:started      { orderId }
//   kitchen:ready        { orderId }
//   menu:item-created    { item }
//   payments:paid        { payment, tableId }

const target = new EventTarget();

export function emit(name, detail = {}) {
  target.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(name, handler) {
  const listener = (e) => handler(e.detail);
  target.addEventListener(name, listener);
  return () => target.removeEventListener(name, listener);
}
