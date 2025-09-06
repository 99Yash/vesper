import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.string(),
  NODE_ENV: z.enum(["development", "production", "staging"]).optional(),
  ABLY_API_KEY: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);