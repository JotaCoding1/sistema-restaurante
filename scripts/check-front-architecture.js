// Verifica as regras do Monolito Modular do front-end.
// O front fica em duas pastas servidas no mesmo endereço:
//   public/base  (parte 1)  e  public/telas  (parte 2)
// Uso: npm run check:front

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
const PARTS = ["base", "telas"]; // ordem dos commits

// Dependências permitidas entre módulos (espelha a tabela do README)
const ALLOWED = {
  identity: [],
  tables: [],
  menu: [],
  reservations: ["tables"],
  orders: ["menu"],
  kitchen: ["orders", "tables"],
  payments: ["orders", "tables"]
};

const errors = [];

// Mapa: caminho virtual (como o navegador vê, a partir de app/) → parte
const files = new Map();
for (const part of PARTS) {
  const root = path.join(PUBLIC, part, "app");
  if (!fs.existsSync(root)) continue;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js")) {
        const virtual = path.relative(root, full).split(path.sep).join("/");
        if (files.has(virtual)) errors.push(`${virtual}: existe em base e em telas`);
        files.set(virtual, { part, full });
      }
    }
  })(root);
}

const graph = {};
const layerOf = (v) => v.split("/")[0]; // shared | modules | pages
const moduleOf = (v) => (v.startsWith("modules/") ? v.split("/")[1] : null);

for (const [from, { part, full }] of files) {
  const src = fs.readFileSync(full, "utf8");
  const imports = [...src.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/gm)].map((m) => m[1]);

  for (const spec of imports) {
    if (!spec.startsWith(".")) {
      errors.push(`${part}/${from}: importação externa não permitida (${spec})`);
      continue;
    }
    const to = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
    const target = files.get(to);
    if (!target) {
      errors.push(`${part}/${from} → ${to}: arquivo não encontrado em base nem em telas`);
      continue;
    }

    // A parte 1 precisa funcionar sozinha: base nunca importa de telas
    if (PARTS.indexOf(target.part) > PARTS.indexOf(part)) {
      errors.push(`${part}/${from} → ${target.part}/${to}: a parte "${part}" não pode depender da parte "${target.part}"`);
    }

    const fromLayer = layerOf(from);
    const toLayer = layerOf(to);

    // shared não importa módulos nem páginas
    if (fromLayer === "shared" && toLayer !== "shared") errors.push(`${from} → ${to}: shared não pode importar ${toLayer}`);

    // Ninguém importa páginas
    if (toLayer === "pages") errors.push(`${from} → ${to}: páginas não são importadas`);

    // Entre módulos (e das páginas), só pelo index.js
    const fromMod = moduleOf(from);
    const toMod = moduleOf(to);
    if (toMod && toMod !== fromMod) {
      if (to !== `modules/${toMod}/index.js`) errors.push(`${from} → ${to}: use modules/${toMod}/index.js`);
      if (fromMod) {
        (graph[fromMod] ??= new Set()).add(toMod);
        if (!ALLOWED[fromMod]?.includes(toMod)) errors.push(`${from} → ${toMod}: dependência não declarada (${fromMod} → ${toMod})`);
      }
    }

    // Só a camada *.api.js de cada módulo fala com a API
    if (to === "shared/http.js" && !/\.api\.js$/.test(from) && from !== "modules/identity/index.js") {
      errors.push(`${from}: só arquivos *.api.js chamam shared/http.js`);
    }
  }
}

// Sem ciclos entre módulos
function findCycle(node, stack = []) {
  if (stack.includes(node)) return [...stack.slice(stack.indexOf(node)), node];
  for (const next of graph[node] ?? []) {
    const cycle = findCycle(next, [...stack, node]);
    if (cycle) return cycle;
  }
  return null;
}
for (const mod of Object.keys(graph)) {
  const cycle = findCycle(mod);
  if (cycle) {
    errors.push(`ciclo entre módulos: ${cycle.join(" → ")}`);
    break;
  }
}

// Todo módulo presente tem interface pública
const present = new Set([...files.keys()].map(moduleOf).filter(Boolean));
for (const mod of present) {
  if (!files.has(`modules/${mod}/index.js`)) errors.push(`modules/${mod}: falta index.js`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} violação(ões) da arquitetura:\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}

console.log(`✓ Arquitetura do front-end ok: ${files.size} arquivos, ${present.size} módulos, sem ciclos.`);
for (const part of PARTS) {
  const mods = Object.keys(ALLOWED).filter((m) => files.get(`modules/${m}/index.js`)?.part === part);
  if (mods.length) console.log(`  ${part}:`);
  for (const mod of mods) console.log(`    ${mod.padEnd(13)} → ${[...(graph[mod] ?? [])].join(", ") || "—"}`);
}
