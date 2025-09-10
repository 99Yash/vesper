import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createId, lifecycle_dates } from "./utils";

export const user = pgTable("user", {
	id: text("id").primaryKey().$defaultFn(() => createId("user")),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	...lifecycle_dates,
}, (table) => [
	uniqueIndex("email_index").on(table.email),
]);

export type User = typeof user.$inferSelect;

export const session = pgTable("session", {
	id: text("id").primaryKey().$defaultFn(() => createId("session")),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	...lifecycle_dates,
});

export type Session = typeof session.$inferSelect;

export const account = pgTable("account", {
	id: text("id").primaryKey().$defaultFn(() => createId("account")),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	...lifecycle_dates,
});

export type Account = typeof account.$inferSelect;

export const verification = pgTable("verification", {
	id: text("id").primaryKey().$defaultFn(() => createId("verification")),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	...lifecycle_dates,
}, (table) => [
	uniqueIndex("identifier_index").on(table.identifier),
]);

export type Verification = typeof verification.$inferSelect;

// Note: User relations are consolidated in clients.ts to include all relationships
// and avoid circular import issues. Only session and account relations are defined here.

export const sessionRelations = relations(session, ({ one }) => ({
	// One session belongs to one user
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	// One account belongs to one user
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));