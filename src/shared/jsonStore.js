// Armazenamento de arquivos JSON. Use com: import { createStore } from "./shared/jsonStore.js";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DATA_DIR = fileURLToPath(new URL("../../data/", import.meta.url));


export function createStore(name, initial) {
  const file = path.join(DATA_DIR, `${name}.json`);
  return {
    read() {
      if (!fs.existsSync(file)) return structuredClone(initial);
      return JSON.parse(fs.readFileSync(file, "utf8"));
    },
    write(data) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  };
}