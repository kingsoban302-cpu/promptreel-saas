import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'db.json');

const defaultData = {
  users: [],
  projects: []
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

export async function initializeDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

export function getDb() {
  return db;
}
