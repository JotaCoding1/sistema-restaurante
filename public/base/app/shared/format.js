// shared/format — formatação de valores, datas e textos (pt-BR).

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const money = (value) => brl.format(value ?? 0).replace(/ /g, " ");

export const time = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const minutesSince = (iso) =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export function longDate(d = new Date()) {
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const rest = d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${rest}`;
}

export const serviceName = (d = new Date()) => (d.getHours() < 16 ? "Serviço do almoço" : "Serviço do jantar");

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const pad2 = (n) => String(n).padStart(2, "0");

// "12,50" | "12.50" | "1.234,50" | "R$ 12,50" → 12.5 (NaN se inválido)
export function parseMoney(text) {
  const raw = String(text ?? "").trim().replace(/\s|R\$/g, "");
  if (!raw) return NaN;
  return Number(raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw);
}

export function escape(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
