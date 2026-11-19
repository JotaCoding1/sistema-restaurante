// shared/http — requisição base para a API.
// Não conhece usuários nem módulos: quem precisa de autenticação registra
// os cabeçalhos e o tratamento de 401 via configureHttp (feito pelo módulo identity).

// Servido pelo Node (npm start): mesma origem.
// Servido por outro servidor (ex.: Live Server): usa o Node em localhost:3000.
const API_PORT = "3000";
const BASE_URL = location.port === API_PORT ? "/api" : `http://localhost:${API_PORT}/api`;

let headersProvider = () => ({});
let unauthorizedHandler = () => {};

export function configureHttp({ headers, onUnauthorized } = {}) {
  if (headers) headersProvider = headers;
  if (onUnauthorized) unauthorizedHandler = onUnauthorized;
}

export async function request(method, path, body) {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: { "Content-Type": "application/json", ...headersProvider() },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Rode npm start e abra http://localhost:3000");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) unauthorizedHandler(path);
    const err = new Error(data?.message ?? `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const get = (path) => request("GET", path);
export const post = (path, body) => request("POST", path, body ?? {});
