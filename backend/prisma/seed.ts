import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Difficulty } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const data: {
  playlist: { title: string; description: string; difficulty: Difficulty };
  slugs: string[];
}[] = [
  {
    playlist: {
      title: "Blind 75",
      description: "Most asked FAANG questions",
      difficulty: "Intermediate",
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
      difficulty: "Beginner",
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
      difficulty: "Advanced",
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
  await prisma.question.deleteMany();
  await prisma.playlist.deleteMany();

  for (const { playlist, slugs } of data) {
    await prisma.playlist.create({
      data: {
        ...playlist,
        questions: {
          create: slugs.map((slug, i) => ({
            slug,
            orderIndex: i,
          })),
        },
      },
    });
  }

  console.log("Seeded successfully");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
