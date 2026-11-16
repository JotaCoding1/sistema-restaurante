import express from "express";
import { fileURLToPath } from "node:url";

import { identityRouter, requireAuth } from "./modules/identity/index.js";
import { tablesRouter } from "./modules/tables/index.js";
import { menuRouter } from "./modules/menu/index.js";
import { ordersRouter } from "./modules/orders/index.js";
import { kitchenRouter } from "./modules/kitchen/index.js";
import { paymentsRouter } from "./modules/payments/index.js";
import { AppError, errorHandler } from "./shared/errors.js";

const app = express();
app.use(express.json());

// Front-end (pasta public/)
app.use(express.static(fileURLToPath(new URL("../public/", import.meta.url))));

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