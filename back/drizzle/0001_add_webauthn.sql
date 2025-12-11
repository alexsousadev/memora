CREATE TABLE "authenticators" (
	"credential_id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" bigint NOT NULL,
	"transports" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_challenge" varchar;--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;