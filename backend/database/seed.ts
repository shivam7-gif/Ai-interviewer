import { db } from "./index.js";
import { playlists, questions } from "./schema.js";

const BASE_URL = "https://alfa-leetcode-api.onrender.com";
const LEETCODE_URL = "https://leetcode.com/problems";

const data = [
  {
    playlist: {
      title: "Blind 75",
      description: "Most asked FAANG questions",
      difficulty: "Intermediate" as const,
    },
    slugs: [
      "two-sum",
      "best-time-to-buy-and-sell-stock",
      "contains-duplicate",
      "maximum-subarray",
      "3sum",
    ],
  },
  {
    playlist: {
      title: "Easy warm-up",
      description: "Start here if you're new",
      difficulty: "Beginner" as const,
    },
    slugs: [
      "two-sum",
      "palindrome-number",
      "valid-parentheses",
      "climbing-stairs",
    ],
  },
  {
    playlist: {
      title: "Dynamic programming",
      description: "Master DP patterns",
      difficulty: "Advanced" as const,
    },
    slugs: [
      "climbing-stairs",
      "coin-change",
      "longest-increasing-subsequence",
      "word-break",
      "house-robber",
    ],
  },
];

async function seed() {
  await db.delete(questions);
  await db.delete(playlists);

  for (const { playlist, slugs } of data) {
    const [inserted] = await db.insert(playlists).values(playlist).returning();

    await db.insert(questions).values(
      slugs.map((slug, i) => ({
        playlistId: inserted.id,
        slug,
        leetcodeUrl: `${LEETCODE_URL}/${slug}/`,
        apiUrl: `${BASE_URL}/select?titleSlug=${slug}`,
        orderIndex: i,
      }))
    );
  }

  console.log("Seeded successfully ");
  process.exit(0);
}

seed();
