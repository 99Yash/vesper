import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { StoredFile } from "../../validators/note.validator";
import { user } from "./auth";
import { createId, lifecycle_dates } from "./utils";

export const note = pgTable("notes", {
	id: varchar("id").primaryKey().$defaultFn(() => createId("note")),
	content: text("content").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	rowVersion: integer("row_version").default(0).notNull(),
	files: jsonb("files").$type<StoredFile[]>(),
	...lifecycle_dates,
});

export type Note = typeof note.$inferSelect;

// Relations
export const noteRelations = relations(note, ({ one }) => ({
	// One note belongs to one user
	user: one(user, {
		fields: [note.userId],
		references: [user.id],
	}),
}));