// Camada de comunicação entre o front-end e a API do back-end.
// Uso nas páginas: <script src="/js/api.js"></script>  →  objeto global `Api`.
// Todas as funções retornam Promises e lançam Error (com .status) em caso de falha.

(function () {
  const BASE_URL = "/api";
  const STORAGE_KEY = "restaurante.user";

  // Página inicial de cada papel
  const HOME_BY_ROLE = {
    WAITER: "/garcom.html",
    COOK: "/cozinha.html",
    CASHIER: "/caixa.html"
  };

  // ---------- Sessão (usuário logado) ----------

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/index.html";
  }

  // Chame no início de cada página protegida: Api.requireRole("WAITER")
  // Redireciona para o login se não houver usuário ou se o papel não for o esperado.
  function requireRole(...roles) {
    const user = getUser();
    if (!user) {
      window.location.href = "/index.html";
      return null;
    }
    if (roles.length && !roles.includes(user.role)) {
      window.location.href = HOME_BY_ROLE[user.role] ?? "/index.html";
      return null;
    }
    return user;
  }

  // ---------- Requisição base ----------

  async function request(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const user = getUser();
    if (user) headers["X-User-Email"] = user.email;

    let res;
    try {
      res = await fetch(BASE_URL + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new Error("Não foi possível conectar ao servidor");
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // Sessão inválida: volta para o login (exceto na própria tela de login)
      if (res.status === 401 && path !== "/login") logout();
      const err = new Error(data?.message ?? `Erro ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const get = (path) => request("GET", path);
  const post = (path, body) => request("POST", path, body ?? {});

  // ---------- Endpoints ----------

  const Api = {
    // Sessão
    getUser,
    logout,
    requireRole,
    homeFor: (user) => HOME_BY_ROLE[user?.role] ?? "/index.html",

    async login(email, password) {
      const { user } = await post("/login", { email, password });
      setUser(user);
      return user;
    },

    // Mesas (GET: qualquer usuário; abrir: WAITER)
    tables: {
      list: () => get("/tables"),
      get: (id) => get(`/tables/${id}`),
      open: (id) => post(`/tables/${id}/open`)
    },

    // Cardápio (GET: qualquer usuário; criar: CASHIER)
    menu: {
      list: () => get("/menu"),
      get: (id) => get(`/menu/${id}`),
      create: (name, price) => post("/menu", { name, price })
    },

    // Pedidos (GET: qualquer usuário; criar/entregar: WAITER)
    orders: {
      list: (status) => get("/orders" + (status ? `?status=${encodeURIComponent(status)}` : "")),
      get: (id) => get(`/orders/${id}`),
      // items: [{ itemId: 1, quantity: 2 }]
      create: (tableId, items) => post("/orders", { tableId, items }),
      deliver: (id) => post(`/orders/${id}/deliver`)
    },

    // Cozinha (somente COOK)
    kitchen: {
      queue: () => get("/kitchen/queue"),
      start: (orderId) => post(`/kitchen/${orderId}/start`),
      ready: (orderId) => post(`/kitchen/${orderId}/ready`)
    },

    // Caixa (somente CASHIER)
    payments: {
      list: () => get("/payments"),
      bill: (tableId) => get(`/payments/table/${tableId}/bill`),
      // method: "CASH" | "CARD" | "PIX"
      pay: (tableId, method) => post(`/payments/table/${tableId}/pay`, { method })
    }
  };

  window.Api = Api;
})();