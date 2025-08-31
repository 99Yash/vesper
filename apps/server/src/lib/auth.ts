import { TRPCError } from "@trpc/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	onAPIError: {
		throw: true,
		onError: (error, ctx) => {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "An error occurred while handling the authentication request",
				cause: error,
			});
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			display:"popup",
			clientId: env.GOOGLE_CLIENT_ID || "",
			clientSecret: env.GOOGLE_CLIENT_SECRET || "",
			redirectUri: `${env.CORS_ORIGIN}`,
		},
	},
	advanced: {
		cookiePrefix: "vesper__",
		defaultCookieAttributes: {
			sameSite: "Lax",
			secure: true,
			httpOnly: true,
		},
	},
});
