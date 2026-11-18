// Recria os dados de exemplo. Use com: npm run seed

import fs from "node:fs";
import { DATA_DIR } from "./shared/jsonStore.js";
import { ROLES } from "./shared/roles.js";
import { createUser } from "./modules/identity/index.js";
import { createTable } from "./modules/tables/index.js";
import { createItem } from "./modules/menu/index.js";

fs.rmSync(DATA_DIR, { recursive: true, force: true });

const users = [
  { name: "Garçom", email: "garcom@restaurante.local", role: ROLES.WAITER },
  { name: "Cozinheiro", email: "cozinha@restaurante.local", role: ROLES.COOK },
  { name: "Caixa", email: "caixa@restaurante.local", role: ROLES.CASHIER }
];
for (const u of users) createUser(u);

for (let i = 1; i <= 6; i++) createTable({ name: `Mesa ${i}` });

const items = [
  { name: "Pizza Margherita", price: 42.9 },
  { name: "Hambúrguer", price: 29.9 },
  { name: "Porção de batata", price: 22 },
  { name: "Refrigerante", price: 7 },
  { name: "Suco natural", price: 9.5 },
  { name: "Sobremesa do dia", price: 14 }
];
for (const i of items) createItem(i);

console.log(`Seed concluído: ${users.length} usuários, 6 mesas e ${items.length} itens.`);