// Recria os dados de exemplo. Use com: npm run seed

import fs from "node:fs";
import { DATA_DIR } from "./shared/jsonStore.js";
import { ROLES } from "./shared/roles.js";
import { createUser } from "./modules/identity/index.js";
import { createTable, openTable } from "./modules/tables/index.js";
import { createItem } from "./modules/menu/index.js";
import { ORDER_STATUS, createOrder, setOrderStatus } from "./modules/orders/index.js";

fs.rmSync(DATA_DIR, { recursive: true, force: true });

const users = [
  { name: "Lucas Ferreira", email: "garcom@restaurante.local", role: ROLES.WAITER },
  { name: "Ana Ribeiro", email: "cozinha@restaurante.local", role: ROLES.COOK },
  { name: "Beatriz Lima", email: "caixa@restaurante.local", role: ROLES.CASHIER }
];
const [waiter] = users.map((u) => createUser(u));

const TABLES = 12;
for (let i = 1; i <= TABLES; i++) createTable({ name: `Mesa ${String(i).padStart(2, "0")}` });

const items = [
  { name: "Burrata com tomates", price: 38 },
  { name: "Risoto de cogumelos", price: 58 },
  { name: "Filé com purê de batatas", price: 72 },
  { name: "Salada da estação", price: 34 },
  { name: "Tiramisù", price: 28 },
  { name: "Água com gás", price: 7 },
  { name: "Suco de laranja", price: 12 },
  { name: "Taça de vinho tinto", price: 32 }
];
const menu = Object.fromEntries(items.map((i) => [i.name, createItem(i).id]));
const line = (name, quantity) => ({ itemId: menu[name], quantity });

// ---------- Cenário de demonstração ----------
// Mesa 02 tem dois pedidos entregues: mostra a diferença entre o subtotal
// de cada pedido e o total da conta, e já pode ser fechada no caixa.
const { PREPARING, READY, DELIVERED } = ORDER_STATUS;
const demo = [
  { table: 2, items: [line("Burrata com tomates", 1), line("Água com gás", 2)], status: DELIVERED },
  { table: 2, items: [line("Risoto de cogumelos", 2), line("Suco de laranja", 2)], status: DELIVERED },
  { table: 9, items: [line("Filé com purê de batatas", 1), line("Taça de vinho tinto", 2)], status: READY },
  { table: 5, items: [line("Salada da estação", 2), line("Suco de laranja", 1)], status: PREPARING },
  { table: 4, items: [line("Filé com purê de batatas", 2), line("Água com gás", 2)] },
  { table: 8, items: [line("Risoto de cogumelos", 1), line("Tiramisù", 2)] }
];

for (const t of new Set(demo.map((d) => d.table))) openTable(t, waiter.id);
for (const d of demo) {
  const order = createOrder({ tableId: d.table, items: d.items }, waiter);
  if (d.status === DELIVERED) {
    setOrderStatus(order.id, PREPARING);
    setOrderStatus(order.id, READY);
  }
  if (d.status) setOrderStatus(order.id, d.status);
}

console.log(`Seed concluído: ${users.length} usuários, ${TABLES} mesas, ${items.length} itens e ${demo.length} pedidos de demonstração.`);
