import { Router } from "express";
import { AppError } from "../../shared/erros.js";
import { authenticate, login } from "./identity.service.js";

export const router = Router();

export function requireAuth(req, res, next) {
  const user = authenticate(req.get("x-user-email"));
  if (!user) return next(new AppError("Autenticação necessária", 401));
  req.user = user;
  next();
}

router.post("/login", (req, res) => {
  res.json(login(req.body?.email, req.body?.password));
});