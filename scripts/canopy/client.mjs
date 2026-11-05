// The only code in ENVEE that may call the Canopy API. Every request goes through canopyGet(),
// which counts it in data/canopy-usage.json and refuses once the month's budget is spent.
// The app never calls Canopy: it reads the cache in data/catalog/. See CLAUDE.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const USAGE_FILE = path.join(root, 'data/canopy-usage.json');
export const MONTHLY_LIMIT = 100;
const BASE = 'https://rest.canopyapi.co';

const thisMonth = () => new Date().toISOString().slice(0, 7); // e.g. 2026-11 (UTC)

/** This month's usage. A new month starts from zero; earlier months' logs are dropped. */
export function readUsage() {
  let u = null;
  try {
    u = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
  } catch {}
  if (!u || u.month !== thisMonth()) u = { month: thisMonth(), limit: MONTHLY_LIMIT, count: 0, log: [] };
  return u;
}

function writeUsage(u) {
  fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(u, null, 2) + '\n');
}

function apiKey() {
  if (!process.env.CANOPY_API_KEY) {
    try {
      process.loadEnvFile(path.join(root, '.env'));
    } catch {}
  }
  const key = process.env.CANOPY_API_KEY;
  if (!key) throw new Error('CANOPY_API_KEY is not set (expected in .env).');
  return key;
}

/**
 * GET a Canopy REST endpoint. Counts the request before sending it, so failed requests count too,
 * and throws without sending anything once MONTHLY_LIMIT requests have been made this month.
 */
export async function canopyGet(endpoint, params, note = '') {
  const key = apiKey();
  const u = readUsage();
  if (u.count >= MONTHLY_LIMIT) {
    throw new Error(`Canopy budget spent: ${u.count}/${MONTHLY_LIMIT} requests in ${u.month}. Not calling the API.`);
  }
  u.count += 1;
  u.log.push({ at: new Date().toISOString(), endpoint, note });
  writeUsage(u);

  const url = new URL(endpoint, BASE);
  for (const [k, v] of Object.entries(params ?? {})) if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { 'API-KEY': key } });
  const body = await res.text();
  if (!res.ok) throw new Error(`Canopy ${endpoint} ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body);
}
