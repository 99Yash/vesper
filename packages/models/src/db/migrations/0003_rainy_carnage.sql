CREATE TABLE "notes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"user_id" varchar NOT NULL,
	"files" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;