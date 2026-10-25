import { client } from "./index.js";
import fs from "fs";

async function main() {
  const sql = fs.readFileSync("./src/db/migrations/0000_fixed_penance.sql", "utf-8");
  const statements = sql.split("--> statement-breakpoint");
  console.log(`Found ${statements.length} statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    try {
      await client.unsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] OK: ${stmt.slice(0, 40).replace(/\n/g, " ")}`);
    } catch (err: any) {
      console.error(`[${i + 1}/${statements.length}] ERROR on: ${stmt.slice(0, 60).replace(/\n/g, " ")}`);
      console.error("Postgres error message:", err.message);
      break;
    }
  }

  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
