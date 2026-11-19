import express from "express";
import { fileURLToPath } from "node:url";

import { identityRouter, requireAuth } from "./modules/identity/index.js";
import { tablesRouter } from "./modules/tables/index.js";
import { menuRouter } from "./modules/menu/index.js";
import { ordersRouter } from "./modules/orders/index.js";
import { kitchenRouter } from "./modules/kitchen/index.js";
import { paymentsRouter } from "./modules/payments/index.js";
import { AppError, errorHandler } from "./shared/erros.js";

const app = express();
app.use(express.json());

// Permite abrir o front-end direto do arquivo ou por outro servidor de desenvolvimento
app.use("/api", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, X-User-Email");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Front-end: duas pastas servidas no mesmo endereço (ver README)
//   public/base  — parte 1: shared, identity, tables, menu e login
//   public/telas — parte 2: reservations, orders, kitchen, payments e telas dos perfis
for (const dir of ["base", "telas"]) {
  app.use(express.static(fileURLToPath(new URL(`../public/${dir}/`, import.meta.url))));
}

// API
app.use("/api", identityRouter); 
app.use("/api/tables", requireAuth, tablesRouter);
app.use("/api/menu", requireAuth, menuRouter);
app.use("/api/orders", requireAuth, ordersRouter);
app.use("/api/kitchen", requireAuth, kitchenRouter);
app.use("/api/payments", requireAuth, paymentsRouter);

// Rota de API inexistente
app.use("/api", (req, res, next) => next(new AppError("Rota não encontrada", 404)));

app.use(errorHandler);

export default app;