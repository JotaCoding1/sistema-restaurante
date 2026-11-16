// Padronização de datas e horas. Use com: import { now, startOfToday } from "./time.js"

export const now = () => new Date().toISOString();

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}