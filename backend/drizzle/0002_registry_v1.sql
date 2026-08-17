CREATE TYPE "public"."user_role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TYPE "public"."codebook_type_v2" AS ENUM('country', 'city', 'municipality_settlement', 'high_school', 'university', 'faculty', 'study_program', 'study_level', 'scholarship_type', 'scholarship_provider');--> statement-breakpoint
CREATE TYPE "public"."consent_type" AS ENUM('terms', 'privacy', 'optional_updates');--> statement-breakpoint
CREATE TYPE "public"."data_request_status" AS ENUM('submitted', 'in_review', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."data_request_type" AS ENUM('correction', 'export', 'restriction', 'deletion');--> statement-breakpoint
CREATE TYPE "public"."education_type" AS ENUM('high_school', 'higher_education');--> statement-breakpoint
CREATE TYPE "public"."scholarship_status" AS ENUM('recorded', 'active', 'completed', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."study_mode" AS ENUM('full_time', 'part_time', 'distance', 'other');--> statement-breakpoint
CREATE TYPE "public"."study_status" AS ENUM('active', 'paused', 'completed', 'withdrawn');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE "user"
SET "first_name" = COALESCE(NULLIF(split_part(trim("name"), ' ', 1), ''), 'Administrator'),
    "last_name" = COALESCE(NULLIF(trim(substring(trim("name") from position(' ' in trim("name")) + 1)), ''), '-'),
    "role" = 'admin';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
CREATE TABLE "codebooks" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "codebook_type_v2" NOT NULL,
	"name" text NOT NULL,
	"is_official" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	CONSTRAINT "codebooks_type_name_uq" UNIQUE("type","name")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"subject_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "consent_type" NOT NULL,
	"version" text NOT NULL,
	"accepted" boolean NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "data_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"requester_email" text NOT NULL,
	"type" "data_request_type" NOT NULL,
	"status" "data_request_status" DEFAULT 'submitted' NOT NULL,
	"details" text,
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" text
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"name" text,
	"scholarship_type_id" text,
	"provider_id" text NOT NULL,
	"academic_year" text NOT NULL,
	"status" "scholarship_status" DEFAULT 'recorded' NOT NULL,
	"start_date" date,
	"end_date" date,
	"amount" numeric(12, 2),
	"currency" text DEFAULT 'BAM' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "student_educations" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"type" "education_type" NOT NULL,
	"country_id" text,
	"city_id" text,
	"high_school_id" text,
	"high_school_program" text,
	"graduation_year" integer,
	"university_id" text,
	"faculty_id" text,
	"study_program_id" text,
	"study_level_id" text,
	"study_mode" "study_mode",
	"first_enrollment_year" integer,
	"current_study_year" integer,
	"expected_graduation_year" integer,
	"study_status" "study_status",
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"birth_date" date,
	"address" text,
	"settlement_id" text,
	"phone" text,
	"completion_percentage" integer DEFAULT 0 NOT NULL,
	"verified_academic_year" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "codebooks" ("id", "type", "name", "is_official", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by")
SELECT "id",
       CASE "type"::text
         WHEN 'faculty' THEN 'faculty'::codebook_type_v2
         WHEN 'field_of_study' THEN 'study_program'::codebook_type_v2
         WHEN 'city' THEN 'city'::codebook_type_v2
       END,
       "name", true, "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by"
FROM "codebook"
WHERE "type"::text IN ('faculty', 'field_of_study', 'city')
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "user" ("id", "name", "first_name", "last_name", "email", "email_verified", "role", "is_active", "created_at", "updated_at")
SELECT 'legacy-' || s."id", concat(s."first_name", ' ', s."last_name"), s."first_name", s."last_name", lower(s."email"), false, 'student', false, s."created_at", s."updated_at"
FROM (
  SELECT DISTINCT ON (lower("email")) *
  FROM "student"
  WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE lower(u."email") = lower("student"."email"))
  ORDER BY lower("email"), "updated_at" DESC, "id"
) s;--> statement-breakpoint
INSERT INTO "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
SELECT 'legacy-account-' || s."id", 'legacy-' || s."id", 'credential', 'legacy-' || s."id", '66be8b9d724ce9c0135dad1b600c1aee:67f51951549ef11cc693437bbcfdc12fa47d8bca1aea197639abaf70af254ac449c4e4038d9d7e722538aa83574c74bd1b0224dd8752d152bc0a738120e2ebd9', s."created_at", s."updated_at"
FROM "student" s
WHERE EXISTS (SELECT 1 FROM "user" u WHERE u."id" = 'legacy-' || s."id")
  AND NOT EXISTS (SELECT 1 FROM "account" a WHERE a."user_id" = 'legacy-' || s."id" AND a."provider_id" = 'credential');--> statement-breakpoint
INSERT INTO "student_profiles" ("id", "user_id", "address", "phone", "completion_percentage", "created_at", "updated_at")
SELECT 'legacy-profile-' || s."id", 'legacy-' || s."id", s."address", s."phone", 30, s."created_at", s."updated_at"
FROM "student" s
WHERE EXISTS (SELECT 1 FROM "user" u WHERE u."id" = 'legacy-' || s."id");--> statement-breakpoint
INSERT INTO "student_educations" ("id", "profile_id", "type", "city_id", "high_school_program", "is_current", "created_at", "updated_at")
SELECT 'legacy-high-school-' || s."id", 'legacy-profile-' || s."id", 'high_school', s."high_school_city_id", cb."name", false, s."created_at", s."updated_at"
FROM "student" s
LEFT JOIN "codebook" cb ON cb."id" = s."high_school_profession_id"
WHERE EXISTS (SELECT 1 FROM "student_profiles" p WHERE p."id" = 'legacy-profile-' || s."id");--> statement-breakpoint
INSERT INTO "student_educations" ("id", "profile_id", "type", "city_id", "faculty_id", "study_program_id", "study_status", "is_current", "created_at", "updated_at")
SELECT 'legacy-study-' || s."id", 'legacy-profile-' || s."id", 'higher_education', s."faculty_city_id", s."faculty_id", s."field_of_study_id",
       CASE WHEN s."is_current_student" THEN 'active'::study_status ELSE 'completed'::study_status END,
       s."is_current_student", s."created_at", s."updated_at"
FROM "student" s
WHERE EXISTS (SELECT 1 FROM "student_profiles" p WHERE p."id" = 'legacy-profile-' || s."id");--> statement-breakpoint
DROP TABLE IF EXISTS "notification";--> statement-breakpoint
DROP TYPE IF EXISTS "notification_type";--> statement-breakpoint
ALTER TABLE "codebook" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "codebook" CASCADE;--> statement-breakpoint
DROP TABLE "student" CASCADE;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "jwks" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "jwks" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "codebooks" ADD CONSTRAINT "codebooks_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codebooks" ADD CONSTRAINT "codebooks_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codebooks" ADD CONSTRAINT "codebooks_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_subject_user_id_user_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_profile_id_student_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_scholarship_type_id_codebooks_id_fk" FOREIGN KEY ("scholarship_type_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_provider_id_codebooks_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_profile_id_student_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_country_id_codebooks_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_city_id_codebooks_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_high_school_id_codebooks_id_fk" FOREIGN KEY ("high_school_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_university_id_codebooks_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_faculty_id_codebooks_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_study_program_id_codebooks_id_fk" FOREIGN KEY ("study_program_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_study_level_id_codebooks_id_fk" FOREIGN KEY ("study_level_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_settlement_id_codebooks_id_fk" FOREIGN KEY ("settlement_id") REFERENCES "public"."codebooks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "codebooks_type_idx" ON "codebooks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "codebooks_name_idx" ON "codebooks" USING btree ("name");--> statement-breakpoint
CREATE INDEX "codebooks_official_idx" ON "codebooks" USING btree ("is_official");--> statement-breakpoint
CREATE INDEX "codebooks_deleted_at_idx" ON "codebooks" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_subject_user_id_idx" ON "audit_logs" USING btree ("subject_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "consents_user_id_idx" ON "consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "consents_type_idx" ON "consents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "data_requests_user_id_idx" ON "data_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_requests_status_idx" ON "data_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "data_requests_created_at_idx" ON "data_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scholarships_profile_id_idx" ON "scholarships" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "scholarships_academic_year_idx" ON "scholarships" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "scholarships_status_idx" ON "scholarships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scholarships_type_idx" ON "scholarships" USING btree ("scholarship_type_id");--> statement-breakpoint
CREATE INDEX "student_educations_profile_id_idx" ON "student_educations" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "student_educations_type_idx" ON "student_educations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "student_educations_current_idx" ON "student_educations" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "student_educations_city_idx" ON "student_educations" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "student_educations_faculty_idx" ON "student_educations" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "student_educations_program_idx" ON "student_educations" USING btree ("study_program_id");--> statement-breakpoint
CREATE INDEX "student_educations_status_idx" ON "student_educations" USING btree ("study_status");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profiles_user_id_uq" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_profiles_updated_at_idx" ON "student_profiles" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "student_profiles_verified_year_idx" ON "student_profiles" USING btree ("verified_academic_year");--> statement-breakpoint
DROP TYPE "public"."codebook_type";--> statement-breakpoint
DROP TYPE "public"."high_school_duration";--> statement-breakpoint
DROP TYPE "public"."high_school_type";
