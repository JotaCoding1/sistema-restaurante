import { AppError, requireFields } from "../../shared/erros.js";
import { ROLES } from "../../shared/roles.js";
import { nextId, readAll, writeAll } from "./identity.repository.js";

export const DEFAULT_PASSWORD = "123456";
const validRoles = new Set(Object.values(ROLES));

export function listUsers() {
  return readAll().users;
}

export function createUser({ name, email, role }) {
  requireFields({ name, email, role }, "name", "email", "role");
  if (!validRoles.has(role)) throw new AppError("Papel inválido", 400);

  const data = readAll();
  const normalizedEmail = email.trim().toLowerCase();
  if (data.users.some((user) => user.email === normalizedEmail)) {
    throw new AppError("E-mail já cadastrado", 409);
  }

  const user = { id: nextId(data.users), name, email: normalizedEmail, role };
  data.users.push(user);
  writeAll(data);
  return user;
}

export function login(email, password) {
  requireFields({ email, password }, "email", "password");
  const normalizedEmail = email.trim().toLowerCase();
  const user = readAll().users.find((item) => item.email === normalizedEmail);
  if (!user || password !== DEFAULT_PASSWORD) {
    throw new AppError("E-mail ou senha inválidos", 401);
  }

  return { user };
}

export function authenticate(email) {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  return readAll().users.find((user) => user.email === normalizedEmail) ?? null;
}