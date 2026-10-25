import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const unpooledUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!unpooledUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
}

// Strip query parameters so pg driver uses explicit ssl options without conflicting
const cleanUrl = unpooledUrl.split("?")[0];

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: cleanUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
