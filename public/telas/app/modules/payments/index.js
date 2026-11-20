// Interface pública do módulo payments
// Responsável por: conta da mesa, forma de pagamento e fechamento da mesa.
// Depende de: orders (subtotais e status), tables (mesas ocupadas, rótulos).

import { emit } from "../../shared/events.js";
import { toast } from "../../shared/dom.js";
import { listOrders } from "../orders/index.js";
import { isOccupied, listTables, tableLabel } from "../tables/index.js";
import { fetchBill, requestPay } from "./payments.api.js";
import { methodByKey } from "./payments.model.js";
import { renderBill, renderBillList, showPaymentSuccess } from "./payments.view.js";

export const getBill = fetchBill;

export async function payAndCloseTable(tableId, methodKey) {
  const method = methodByKey(methodKey);
  if (!method) throw new Error("Escolha a forma de pagamento.");
  const payment = await requestPay(tableId, method.api);
  emit("payments:paid", { payment, tableId });
  return payment;
}

// Mesa de caixa: lista de mesas ocupadas + conta selecionada.
// Retorna { refresh } para a página recarregar quando quiser.
export function mountCashierDesk({ listEl, billEl, countEl }) {
  const state = { tables: [], orders: [], selectedId: null, bill: null, methodKey: null, busy: false };

  const selectedTable = () => state.tables.find((t) => t.id === state.selectedId);
  const drawList = () => {
    renderBillList(listEl, state);
    if (countEl) countEl.textContent = `${state.tables.length} ${state.tables.length === 1 ? "mesa" : "mesas"}`;
  };
  const drawBill = () => renderBill(billEl, { bill: state.bill, table: selectedTable(), methodKey: state.methodKey });

  async function loadBill() {
    state.bill = state.selectedId ? await getBill(state.selectedId) : null;
  }

  async function refresh() {
    if (state.busy) return;
    try {
      const [tables, orders] = await Promise.all([listTables(), listOrders()]);
      state.tables = tables.filter(isOccupied);
      state.orders = orders;
      if (!state.tables.some((t) => t.id === state.selectedId)) {
        state.selectedId = state.tables[0]?.id ?? null;
        state.methodKey = null;
      }
      await loadBill();
      drawList();
      drawBill();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-table-id]");
    if (!btn) return;
    state.selectedId = Number(btn.dataset.tableId);
    state.methodKey = null;
    drawList();
    try {
      await loadBill();
      drawBill();
      if (window.innerWidth <= 1180) billEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      toast(err.message, "error");
    }
  });

  billEl.addEventListener("change", (e) => {
    if (e.target.name !== "method") return;
    state.methodKey = e.target.value;
    drawBill();
  });

  billEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-pay]");
    if (!btn || !state.bill) return;
    const { tableId, total } = state.bill;
    const label = tableLabel(selectedTable() ?? { id: tableId });
    const methodLabel = methodByKey(state.methodKey)?.label;

    btn.disabled = true;
    btn.textContent = "Confirmando…";
    state.busy = true;
    try {
      await payAndCloseTable(tableId, state.methodKey);
      // A mesa sai da lista; no salão ela volta como Livre
      state.tables = state.tables.filter((t) => t.id !== tableId);
      state.selectedId = null;
      state.methodKey = null;
      showPaymentSuccess({ label, total, methodLabel });
    } catch (err) {
      toast(err.message, "error");
      btn.disabled = false;
      btn.textContent = "Confirmar pagamento e fechar mesa";
    } finally {
      state.busy = false;
    }
    refresh();
  });

  return { refresh };
}

export { METHODS, canClose, blockingOrders } from "./payments.model.js";
