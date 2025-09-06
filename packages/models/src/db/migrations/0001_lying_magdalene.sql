CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"client_group_id" varchar NOT NULL,
	"last_mutation_id" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "client_groups" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"cvr_version" integer NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_client_group_id_client_groups_id_fk" FOREIGN KEY ("client_group_id") REFERENCES "public"."client_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_groups" ADD CONSTRAINT "client_groups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;