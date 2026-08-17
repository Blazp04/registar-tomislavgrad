import assert from "node:assert/strict";
import test from "node:test";
import { educationSchema, scholarshipSchema } from "./student.js";

test("higher education requires all administratively necessary fields", () => {
  const result = educationSchema.safeParse({ type: "higher_education", isCurrent: true });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.issues.some((issue) => issue.path[0] === "facultyId"));
});

test("high school record accepts a complete minimal payload", () => {
  const result = educationSchema.safeParse({ type: "high_school", cityId: "b35fb317-e337-47a7-a1e2-50e785def7a2", highSchoolId: "090e32c1-3b56-43ad-972f-c7ac56f7d9ab", highSchoolProgram: "Gimnazija", graduationYear: 2024, isCurrent: false });
  assert.equal(result.success, true);
});

test("scholarship validates academic year and requires name or type", () => {
  const result = scholarshipSchema.safeParse({ providerId: "b35fb317-e337-47a7-a1e2-50e785def7a2", academicYear: "2026", status: "active", currency: "BAM" });
  assert.equal(result.success, false);
});
