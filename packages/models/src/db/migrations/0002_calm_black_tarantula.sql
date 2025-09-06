CREATE UNIQUE INDEX "account_user_id_index" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_index" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_index" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "identifier_index" ON "verification" USING btree ("identifier");