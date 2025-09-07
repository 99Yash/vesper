import { jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { StoredFile } from "../../validators/note.validator";
import { user } from "./auth";
import { createId, lifecycle_dates } from "./utils";

export const note = pgTable("notes", {
	id: varchar("id").primaryKey().$defaultFn(() => createId("note")),
	content: text("content").notNull(),
	userId: varchar("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	files: jsonb("files").$type<StoredFile[]>(),
	...lifecycle_dates,
});

export type Note = typeof note.$inferSelect;