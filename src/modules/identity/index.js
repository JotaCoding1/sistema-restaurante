// Interface pública do módulo identity
export { router as identityRouter, requireAuth } from "./identity.routes.js";
export { DEFAULT_PASSWORD, createUser, listUsers, login, authenticate } from "./identity.service.js";