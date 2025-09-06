import { z } from "zod";
import { env } from "~/env";

export const LAST_AUTH_METHOD = z.union([
	z.literal("email"),
	z.literal("google"),
]);

export type AuthOptionsType = z.infer<typeof LAST_AUTH_METHOD>;

export const LOCAL_STORAGE_SCHEMAS = {
	LAST_AUTH_METHOD,
} as const;

export const SESSION_STORAGE_SCHEMAS = {
	SHOW_USERNAME_MODAL: z.boolean().default(false),
} as const;

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_SCHEMAS;

export type LocalStorageValue<K extends LocalStorageKey> = z.infer<
	(typeof LOCAL_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;

export type SessionStorageKey = keyof typeof SESSION_STORAGE_SCHEMAS;

export type SessionStorageValue<K extends SessionStorageKey> = z.infer<
	(typeof SESSION_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;

export const OAUTH_PROVIDERS = {
	google: {
		id: "google",
		name: "Google",
		authUrl: `${env.NEXT_PUBLIC_SERVER_URL}/auth/social/google`,
	},
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;
