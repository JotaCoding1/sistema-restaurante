// kitchen.api — único ponto do front que chama /api/kitchen.

import { post } from "../../shared/http.js";

export const requestStart = (orderId) => post(`/kitchen/${orderId}/start`);
export const requestReady = (orderId) => post(`/kitchen/${orderId}/ready`);
