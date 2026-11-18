import { Router } from "express";
import { allowRoles } from "../../shared/allowRoles.js";
import { ROLES } from "../../shared/roles.js";
import { getQueue, startPreparing, markReady } from "./kitchen.service.js";

export const router = Router();

router.use(allowRoles(ROLES.COOK));

router.get("/queue", (req, res) => res.json(getQueue()));
router.post("/:orderId/start", (req, res) => res.json(startPreparing(req.params.orderId)));
router.post("/:orderId/ready", (req, res) => res.json(markReady(req.params.orderId)));
