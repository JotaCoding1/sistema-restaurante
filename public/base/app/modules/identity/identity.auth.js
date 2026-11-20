// identity.auth — fluxo de login compartilhado pela entrada e troca de contas.

import { requestLogin } from "./identity.api.js";
import { saveUser } from "./identity.session.js";

export const DEMO_PASSWORD = "123456";
export const DEMO_ACCOUNTS = [
  { role: "WAITER",  email: "garcom@restaurante.local" },
  { role: "COOK",    email: "cozinha@restaurante.local" },
  { role: "CASHIER", email: "caixa@restaurante.local" }
];

export async function login(email, password) {
  const user = await requestLogin(email, password);
  // Uma falha na autenticação mantém a sessão anterior intacta.
  saveUser(user);
  return user;
}
