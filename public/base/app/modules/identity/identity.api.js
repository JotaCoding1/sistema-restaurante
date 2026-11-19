// identity.api — único ponto do front que chama /api/login.

import { post } from "../../shared/http.js";

export async function requestLogin(email, password) {
  const { user } = await post("/login", { email, password });
  return user;
}
