import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { account, session, user } from "./auth";
import { note } from "./note";
import { createId, lifecycle_dates } from "./utils";

export const client = pgTable("clients", {
	id: varchar("id").primaryKey().$defaultFn(() => createId("client")),
	name: varchar("name").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	clientGroupId: varchar("client_group_id").notNull().references(() => client_group.id, { onDelete: "cascade" }),
	lastMutationId: integer("last_mutation_id").default(0).notNull(),
	lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
	...lifecycle_dates,
});

export type Client = typeof client.$inferSelect;

export const client_group = pgTable("client_groups", {
	id: varchar("id").primaryKey().$defaultFn(() => createId("client_group")),
	name: varchar("name").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	cvrVersion: integer("cvr_version").notNull(),
	lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
	...lifecycle_dates,
});

export type ClientGroup = typeof client_group.$inferSelect;

// Relations
export const clientGroupRelations = relations(client_group, ({ one, many }) => ({
	// One client group belongs to one user
	user: one(user, {
		fields: [client_group.userId],
		references: [user.id],
	}),
	// One client group has many clients
	clients: many(client),
}));

export const clientRelations = relations(client, ({ one }) => ({
	// One client belongs to one user
	user: one(user, {
		fields: [client.userId],
		references: [user.id],
	}),
	// One client belongs to one client group
	clientGroup: one(client_group, {
		fields: [client.clientGroupId],
		references: [client_group.id],
	}),
}));

// Comprehensive user relations (defined here to avoid circular imports and consolidate all relationships)
export const userRelations = relations(user, ({ many }) => ({
	// Auth-related relations
	sessions: many(session),
	accounts: many(account),
	// Client-related relations  
	clientGroups: many(client_group),
	clients: many(client),
	// Note relations
	notes: many(note),
}));