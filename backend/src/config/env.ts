import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .default("3001")
    .transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().default("*"),
  LIVEKIT_URL: z.string().optional().default("wss://placeholder.livekit.cloud"),
  LIVEKIT_API_KEY: z.string().optional().default("placeholder_key"),
  LIVEKIT_API_SECRET: z.string().optional().default("placeholder_secret"),
  GROQ_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().default("interviewos-secret-key-change-in-production"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  return result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);
};

export const env = parseEnv();
