import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { lifecycle_dates } from "./utils";

export const client = pgTable("clients", {
	id: varchar("id").primaryKey(),
	name: varchar("name").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	clientGroupId: varchar("client_group_id").notNull().references(() => client_group.id, { onDelete: "cascade" }),
	lastMutationId: integer("last_mutation_id").default(0).notNull(),
	lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
	...lifecycle_dates,
});

export type Client = typeof client.$inferSelect;

export const client_group = pgTable("client_groups", {
	id: varchar("id").primaryKey(),
	name: varchar("name").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	cvrVersion: integer("cvr_version").notNull(),
	lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
	...lifecycle_dates,
});

export type ClientGroup = typeof client_group.$inferSelect;