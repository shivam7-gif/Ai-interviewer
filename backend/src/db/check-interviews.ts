import { client } from "./index.js";

async function main() {
  const rows = await client`SELECT * FROM interviews`;
  console.log("Interviews:", rows);
  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
