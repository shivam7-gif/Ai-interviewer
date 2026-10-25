import { client } from "./index.js";

async function main() {
  console.log("Renaming legacy tables to avoid conflicts with Drizzle schema...");
  await client`ALTER TABLE IF EXISTS "messages" RENAME TO "legacy_messages"`;
  await client`ALTER TABLE IF EXISTS "users" RENAME TO "legacy_users"`;
  console.log("Renamed successfully!");
  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
