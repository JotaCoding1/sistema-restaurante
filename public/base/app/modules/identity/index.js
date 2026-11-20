// Interface pública do módulo identity
// Responsável por: sessão do usuário, login, papéis e topo da tela.
// Depende de: nenhum módulo.

import { configureHttp } from "../../shared/http.js";
import { getUser, logout } from "./identity.session.js";

// Toda requisição leva o e-mail do usuário; sessão inválida volta ao login.
configureHttp({
  headers: () => {
    const user = getUser();
    return user ? { "X-User-Email": user.email } : {};
  },
  onUnauthorized: (path) => {
    if (path !== "/login") logout();
  }
});

export { ROLES, getUser, logout, homeFor, requireRole } from "./identity.session.js";
export { login } from "./identity.auth.js";
export { mountLoginView, mountUserTopbar } from "./identity.view.js";
