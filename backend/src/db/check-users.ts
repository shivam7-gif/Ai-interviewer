import { client } from "./index.js";

async function main() {
  const userCols = await client`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
  `;
  console.log("Users columns:", userCols);

  const userRows = await client`SELECT * FROM users LIMIT 5`;
  console.log("Users rows:", userRows);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
