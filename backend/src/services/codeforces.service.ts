import type {
  CfEnvelope,
  CfSubmission,
  CfUser,
  CodeforcesProfile,
} from "../types/index.js";

const CF_API = "https://codeforces.com/api";
const HANDLE_RE = /^[A-Za-z0-9_.-]{3,24}$/;
const SUBMISSION_COUNT = 2000;
const MIN_TRIED_FOR_WEAK = 5;
const MIN_GAP_MS = 2100; // Codeforces asks for roughly 1 request per 2 seconds
const CACHE_TTL_MS = 10 * 60 * 1000;

export class CodeforcesError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CodeforcesError";
    this.status = status;
  }
}

// ---------- throttle: one outbound call at a time, spaced apart ----------
let lastCall = 0;
let chain: Promise<void> = Promise.resolve();

function throttle(): Promise<void> {
  const next = chain.then(async () => {
    const wait = Math.max(0, lastCall + MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
  });
  chain = next.catch(() => undefined);
  return next;
}

// ---------- low-level API call ----------
async function cfGet<T>(
  method: string,
  params: Record<string, string | number>
): Promise<T> {
  await throttle();

  const url = new URL(`${CF_API}/${method}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new CodeforcesError("Codeforces did not respond. Try again shortly.", 502);
  }

  let body: CfEnvelope<T>;
  try {
    body = (await res.json()) as CfEnvelope<T>;
  } catch {
    throw new CodeforcesError("Unexpected response from Codeforces.", 502);
  }

  if (body.status !== "OK") {
    const comment = body.comment ?? "";
    if (/not found/i.test(comment)) throw new CodeforcesError("Codeforces user not found.", 404);
    if (/limit/i.test(comment)) throw new CodeforcesError("Codeforces rate limit hit. Try again in a moment.", 429);
    throw new CodeforcesError("Codeforces API error.", 502);
  }
  return body.result as T;
}

// ---------- input handling ----------
export function extractHandle(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/codeforces\.com\/profile\/([^/?#\s]+)/i);
  const handle = fromUrl && fromUrl[1] ? fromUrl[1] : trimmed;
  if (!handle || !HANDLE_RE.test(handle)) {
    throw new CodeforcesError("Invalid Codeforces handle.", 400);
  }
  return handle;
}

// ---------- analysis ----------
function analyse(subs: CfSubmission[]) {
  const solvedAll = new Set<string>();
  const tried = new Map<string, Set<string>>();
  const solved = new Map<string, Set<string>>();

  for (const s of subs) {
    const p = s.problem;
    const id = `${p.contestId ?? "x"}-${p.index}-${p.name}`;
    const ok = s.verdict === "OK";
    if (ok) solvedAll.add(id);

    for (const tag of p.tags ?? []) {
      if (!tried.has(tag)) tried.set(tag, new Set());
      tried.get(tag)!.add(id);
      if (ok) {
        if (!solved.has(tag)) solved.set(tag, new Set());
        solved.get(tag)!.add(id);
      }
    }
  }

  const solvedCount = (tag: string) => solved.get(tag)?.size ?? 0;

  const strongTags = [...tried.keys()]
    .sort((a, b) => solvedCount(b) - solvedCount(a))
    .slice(0, 3);

  const weakTags = [...tried.keys()]
    .filter((t) => tried.get(t)!.size >= MIN_TRIED_FOR_WEAK)
    .sort(
      (a, b) =>
        solvedCount(a) / tried.get(a)!.size - solvedCount(b) / tried.get(b)!.size
    )
    .slice(0, 3);

  return { solvedRecent: solvedAll.size, strongTags, weakTags };
}

async function load(handle: string): Promise<CodeforcesProfile> {
  const users = await cfGet<CfUser[]>("user.info", { handles: handle });
  const user = users?.[0];
  if (!user) {
    throw new CodeforcesError("Codeforces user not found.", 404);
  }
  const subs = await cfGet<CfSubmission[]>("user.status", {
    handle,
    from: 1,
    count: SUBMISSION_COUNT,
  });

  return {
    handle: user.handle,
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    maxRank: user.maxRank ?? null,
    submissionsAnalysed: subs.length,
    ...analyse(subs),
    fetchedAt: new Date().toISOString(),
  };
}

// ---------- cache + de-duplication of simultaneous requests ----------
const cache = new Map<string, { expires: number; value: CodeforcesProfile }>();
const inflight = new Map<string, Promise<CodeforcesProfile>>();

export async function fetchCodeforcesProfile(input: string): Promise<CodeforcesProfile> {
  const handle = extractHandle(input);
  const key = handle.toLowerCase();

  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = load(handle)
    .then((value) => {
      cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
      return value;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

// ---------- text for the AI engine's planner ----------
export function codeforcesToText(p: CodeforcesProfile): string {
  return [
    `Codeforces handle: ${p.handle} | rating ${p.rating ?? "unrated"} (max ${p.maxRating ?? "n/a"}, ${p.maxRank ?? "n/a"})`,
    `Distinct problems solved in the last ${p.submissionsAnalysed} submissions: ${p.solvedRecent}`,
    `Strongest topics: ${p.strongTags.join(", ") || "n/a"}`,
    `Weakest topics (lowest solve rate): ${p.weakTags.join(", ") || "n/a"}`,
  ].join("\n");
}

// ---------- PostgreSQL persistence ----------
import { randomUUID } from "node:crypto";
import { prisma } from "../config/db.js";

export async function saveCodeforcesProfileToDb(
  profile: CodeforcesProfile,
  summary: string
): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS codeforces_profiles (
      id TEXT PRIMARY KEY,
      handle TEXT UNIQUE NOT NULL,
      rating INTEGER,
      max_rating INTEGER,
      rank TEXT,
      max_rank TEXT,
      solved_recent INTEGER DEFAULT 0,
      submissions_analysed INTEGER DEFAULT 0,
      strong_tags TEXT[] DEFAULT '{}',
      weak_tags TEXT[] DEFAULT '{}',
      summary TEXT,
      profile_data JSONB,
      fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await prisma.$executeRaw`
    INSERT INTO codeforces_profiles (
      id, handle, rating, max_rating, rank, max_rank,
      solved_recent, submissions_analysed, strong_tags, weak_tags,
      summary, profile_data, fetched_at, updated_at
    ) VALUES (
      ${randomUUID()},
      ${profile.handle.toLowerCase()},
      ${profile.rating},
      ${profile.maxRating},
      ${profile.rank},
      ${profile.maxRank},
      ${profile.solvedRecent},
      ${profile.submissionsAnalysed},
      ${profile.strongTags},
      ${profile.weakTags},
      ${summary},
      ${JSON.stringify(profile)}::jsonb,
      ${new Date(profile.fetchedAt)},
      NOW()
    )
    ON CONFLICT (handle) DO UPDATE SET
      rating = EXCLUDED.rating,
      max_rating = EXCLUDED.max_rating,
      rank = EXCLUDED.rank,
      max_rank = EXCLUDED.max_rank,
      solved_recent = EXCLUDED.solved_recent,
      submissions_analysed = EXCLUDED.submissions_analysed,
      strong_tags = EXCLUDED.strong_tags,
      weak_tags = EXCLUDED.weak_tags,
      summary = EXCLUDED.summary,
      profile_data = EXCLUDED.profile_data,
      fetched_at = EXCLUDED.fetched_at,
      updated_at = NOW();
  `;
}

