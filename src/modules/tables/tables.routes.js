import { Router } from "express";
import { allowRoles } from "../../shared/allowRoles.js";
import { ROLES } from "../../shared/roles.js";
import { listTables, getTable, openTable } from "./tables.service.js";

export const router = Router();

router.get("/", (req, res) => res.json(listTables()));

router.get("/:id", (req, res) => res.json(getTable(req.params.id)));

// Fechar a mesa não tem rota: acontece ao pagar (módulo payments)
router.post("/:id/open", allowRoles(ROLES.WAITER), (req, res) => {
  res.status(201).json(openTable(req.params.id, req.user.id));
});
