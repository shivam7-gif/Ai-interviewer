import type { Request, Response } from "express";
import {
  CodeforcesError,
  codeforcesToText,
  fetchCodeforcesProfile,
  saveCodeforcesProfileToDb,
} from "../services/codeforces.service.js";

export async function getCodeforcesProfile(req: Request, res: Response) {
  try {
    const rawHandle = req.params.handle;
    const handle = Array.isArray(rawHandle) ? rawHandle[0] : rawHandle;
    if (!handle) {
      return res.status(400).json({ error: "Codeforces handle is required." });
    }

    const profile = await fetchCodeforcesProfile(handle);
    const summary = codeforcesToText(profile);
    const responsePayload = { profile, summary };

    // 1. Console the response as requested
    console.log("\n==========================================");
    console.log("=== [Codeforces API Response Fetched] ===");
    console.log("==========================================");
    console.log(JSON.stringify(responsePayload, null, 2));

    // 2. Store in PostgreSQL DB
    try {
      await saveCodeforcesProfileToDb(profile, summary);
      console.log(`[DB] Successfully stored profile for '${profile.handle}' in PostgreSQL table 'codeforces_profiles'\n`);
    } catch (dbError) {
      console.error("[DB Error] Could not persist Codeforces profile:", dbError);
    }

    return res.json(responsePayload);
  } catch (err) {
    if (err instanceof CodeforcesError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(
      "Codeforces profile failed:",
      err instanceof Error ? err.message : "unknown"
    );
    return res
      .status(500)
      .json({ error: "Could not load the Codeforces profile." });
  }
}
