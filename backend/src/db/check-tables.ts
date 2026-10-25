import { client } from "./index.js";

async function main() {
  const tables = await client`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  console.log("Existing tables:", tables.map((t) => t.tablename));

  const types = await client`SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public'`;
  console.log("Existing types:", types.map((t) => t.typname));

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
