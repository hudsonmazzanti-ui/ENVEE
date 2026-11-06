// Prints this month's Canopy usage. Spends nothing.   npm run catalog:usage
import { MONTHLY_LIMIT, readUsage } from './client.mjs';

const u = readUsage();
console.log(`Canopy usage ${u.month}: ${u.count}/${MONTHLY_LIMIT} requests (${MONTHLY_LIMIT - u.count} left)`);
for (const e of u.log) console.log(`  ${e.at}  ${e.endpoint}  ${e.note}`);
