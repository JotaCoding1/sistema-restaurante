// tables.api — único ponto do front que chama /api/tables.

import { get, post } from "../../shared/http.js";

export const fetchTables = () => get("/tables");
export const requestOpenTable = (tableId) => post(`/tables/${tableId}/open`);
