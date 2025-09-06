import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "staging"]).optional(),
	GOOGLE_CLIENT_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	DATABASE_URL: z.url(),
	CORS_ORIGIN: z.url(),
	API_SERVER_PORT: z.string(),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
	const safeParseResult = envSchema.safeParse(env);
	if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
	return safeParseResult.data;
}

export const env = createEnv(process.env);
