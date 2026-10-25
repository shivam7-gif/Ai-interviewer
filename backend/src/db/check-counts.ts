import { client } from "./index.js";

async function main() {
  const msgCount = await client`SELECT count(*) FROM messages`;
  console.log("messages count:", msgCount);
  const interviewCount = await client`SELECT count(*) FROM interviews`;
  console.log("interviews count:", interviewCount);
  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Err:", err);
  process.exit(1);
});
