import { Router } from "express";
import { allowRoles } from "../../shared/allowRoles.js";
import { ROLES } from "../../shared/roles.js";
import { createItem, getItem, listItems } from "./menu.service.js";

export const router = Router();

router.get("/", (req, res) => res.json(listItems()));

router.get("/:id", (req, res) => res.json(getItem(req.params.id)));

router.post("/", allowRoles(ROLES.CASHIER), (req, res) => {
  res.status(201).json(createItem(req.body ?? {}));
});