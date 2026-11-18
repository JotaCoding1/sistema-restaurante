import { Router } from "express";
import { allowRoles } from "../../shared/allowRoles.js";
import { ROLES } from "../../shared/roles.js";
import { createOrder, getOrder, listOrders, markDelivered } from "./orders.service.js";

export const router = Router();

router.get("/", (req, res) => res.json(listOrders(req.query)));
router.get("/:id", (req, res) => res.json(getOrder(req.params.id)));

router.post("/", allowRoles(ROLES.WAITER), (req, res) => {
  res.status(201).json(createOrder(req.body ?? {}, req.user));
});

router.post("/:id/deliver", allowRoles(ROLES.WAITER), (req, res) => {
  res.json(markDelivered(req.params.id));
});