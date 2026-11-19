// menu.api — único ponto do front que chama /api/menu.

import { get, post } from "../../shared/http.js";

export const fetchMenu = () => get("/menu");
export const requestCreateItem = (name, price) => post("/menu", { name, price });
