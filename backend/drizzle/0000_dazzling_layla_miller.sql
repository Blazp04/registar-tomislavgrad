CREATE TYPE "public"."codebook_type" AS ENUM('faculty', 'field_of_study', 'high_school_profession', 'city');--> statement-breakpoint
CREATE TYPE "public"."high_school_duration" AS ENUM('trogodisnja', 'cetverogodisnja', 'petogodisnja');--> statement-breakpoint
CREATE TYPE "public"."high_school_type" AS ENUM('gimnazija', 'strukovna');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codebook" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "codebook_type" NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	CONSTRAINT "codebook_type_name_uq" UNIQUE("type","name")
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"father_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"is_current_student" boolean DEFAULT true NOT NULL,
	"is_employed" boolean DEFAULT false NOT NULL,
	"is_working_in_field" boolean DEFAULT false,
	"high_school_type" "high_school_type" NOT NULL,
	"high_school_duration" "high_school_duration" NOT NULL,
	"high_school_profession_id" text,
	"high_school_city_id" text NOT NULL,
	"faculty_id" text NOT NULL,
	"field_of_study_id" text NOT NULL,
	"faculty_city_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codebook" ADD CONSTRAINT "codebook_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codebook" ADD CONSTRAINT "codebook_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codebook" ADD CONSTRAINT "codebook_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_high_school_profession_id_codebook_id_fk" FOREIGN KEY ("high_school_profession_id") REFERENCES "public"."codebook"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_high_school_city_id_codebook_id_fk" FOREIGN KEY ("high_school_city_id") REFERENCES "public"."codebook"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_faculty_id_codebook_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."codebook"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_field_of_study_id_codebook_id_fk" FOREIGN KEY ("field_of_study_id") REFERENCES "public"."codebook"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_faculty_city_id_codebook_id_fk" FOREIGN KEY ("faculty_city_id") REFERENCES "public"."codebook"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "codebook_type_idx" ON "codebook" USING btree ("type");--> statement-breakpoint
CREATE INDEX "codebook_name_idx" ON "codebook" USING btree ("name");--> statement-breakpoint
CREATE INDEX "codebook_deleted_at_idx" ON "codebook" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "student_high_school_profession_id_idx" ON "student" USING btree ("high_school_profession_id");--> statement-breakpoint
CREATE INDEX "student_high_school_city_id_idx" ON "student" USING btree ("high_school_city_id");--> statement-breakpoint
CREATE INDEX "student_faculty_id_idx" ON "student" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "student_field_of_study_id_idx" ON "student" USING btree ("field_of_study_id");--> statement-breakpoint
CREATE INDEX "student_faculty_city_id_idx" ON "student" USING btree ("faculty_city_id");--> statement-breakpoint
CREATE INDEX "student_is_current_student_idx" ON "student" USING btree ("is_current_student");--> statement-breakpoint
CREATE INDEX "student_is_employed_idx" ON "student" USING btree ("is_employed");--> statement-breakpoint
CREATE INDEX "student_deleted_at_idx" ON "student" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "student_last_name_idx" ON "student" USING btree ("last_name");