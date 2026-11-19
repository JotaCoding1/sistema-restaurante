// identity.session — usuário logado, papéis e rotas de cada papel.

const STORAGE_KEY = "restaurante.user";

export const ROLES = {
  WAITER:  { label: "Garçom",  area: "Salão",   icon: "grid",   home: "garcom.html" },
  COOK:    { label: "Cozinha", area: "Cozinha", icon: "chef",   home: "cozinha.html" },
  CASHIER: { label: "Caixa",   area: "Caixa",   icon: "wallet", home: "caixa.html" }
};

const LOGIN_PAGE = "index.html";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = LOGIN_PAGE;
}

export const homeFor = (user) => ROLES[user?.role]?.home ?? LOGIN_PAGE;

// Garante o papel da página; senão redireciona (login ou tela do próprio papel)
export function requireRole(role) {
  const user = getUser();
  if (!user) {
    window.location.replace(LOGIN_PAGE);
    return null;
  }
  if (role && user.role !== role) {
    window.location.replace(homeFor(user));
    return null;
  }
  return user;
}
