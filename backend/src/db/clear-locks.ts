import { client } from "./index.js";

async function main() {
  const acts = await client`
    SELECT pid, state, query, age(clock_timestamp(), query_start) as duration
    FROM pg_stat_activity
    WHERE pid != pg_backend_pid()
  `;
  console.log("Activities:", acts);

  // Terminate any hanging backends from previous test runs if any
  for (const a of acts) {
    if (a.state !== 'idle' && a.pid) {
      console.log('Terminating pid:', a.pid);
      await client`SELECT pg_terminate_backend(${a.pid})`;
    }
  }

  await client.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
