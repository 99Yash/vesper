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
	trustedOrigins: [env.CORS_ORIGIN],
	baseURL: env.BETTER_AUTH_URL,
	appName: "Vesper",
	telemetry: {
		debug: env.NODE_ENV === "development",
	},
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
		autoSignIn: true,
		requireEmailVerification: false,
		minPasswordLength: 6,
		maxPasswordLength: 128,
		disableSignUp: false,
	},
	socialProviders: {
		google: {
			display: "popup",
			prompt: "select_account",
			clientId: env.GOOGLE_CLIENT_ID || "",
			clientSecret: env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	advanced: {
		cookiePrefix: "vesper__",
		defaultCookieAttributes: {
			sameSite: "lax",
			secure: env.NODE_ENV === "production", // Only secure in production
			httpOnly: true,
			// Remove invalid domain setting for localhost development
		},
		crossSubDomainCookies: {
			enabled: false, // Disable for localhost development
		},
	},
});
