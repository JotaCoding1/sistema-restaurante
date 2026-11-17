import { Router } from "express";
import { allowRoles } from "../../shared/allowRoles.js";
import { ROLES } from "../../shared/roles.js";
import { getBill, pay, listPayments } from "./payments.service.js";

export const router = Router();

router.use(allowRoles(ROLES.CASHIER));

router.get("/", (req, res) => res.json(listPayments()));
router.get("/table/:tableId/bill", (req, res) => res.json(getBill(req.params.tableId)));
router.post("/table/:tableId/pay", (req, res) => {
  res.status(201).json(pay(req.params.tableId, req.body ?? {}, req.user));
});
