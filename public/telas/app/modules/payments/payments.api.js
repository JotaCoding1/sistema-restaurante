// payments.api — único ponto do front que chama /api/payments.

import { get, post } from "../../shared/http.js";

export const fetchBill = (tableId) => get(`/payments/table/${tableId}/bill`);
// method: "PIX" | "CASH" | "CARD"
export const requestPay = (tableId, method) => post(`/payments/table/${tableId}/pay`, { method });
