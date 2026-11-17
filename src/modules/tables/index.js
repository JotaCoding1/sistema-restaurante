// Interface pública do módulo tables
export { router as tablesRouter } from "./tables.routes.js";
export { listTables, getTable, createTable, openTable, getCurrentSession, closeTable } from "./tables.service.js";
