import assert from "node:assert/strict";
import test from "node:test";
import { calculateProfileCompletion, getCurrentAcademicYear } from "./profileCompletion.js";

test("profile completion is 100 when all required groups are present", () => {
  const result = calculateProfileCompletion({
    user: { firstName: "Ana", lastName: "Anić", email: "ana@example.com" },
    profile: { birthDate: "2002-01-01", address: "Ulica 1", settlementId: "settlement", phone: "063123456" },
    educations: [
      { type: "high_school", highSchoolId: "school", cityId: "city", highSchoolProgram: "Gimnazija", graduationYear: 2020 },
      { type: "higher_education", isCurrent: true, countryId: "country", cityId: "city", universityId: "university", facultyId: "faculty", studyProgramId: "program", studyLevelId: "level", studyMode: "full_time", firstEnrollmentYear: 2020, currentStudyYear: 4, expectedGraduationYear: 2025, studyStatus: "active" },
    ],
  });
  assert.equal(result, 100);
});

test("profile completion remains partial without education", () => {
  const result = calculateProfileCompletion({
    user: { firstName: "Ana", lastName: "Anić", email: "ana@example.com" },
    profile: { birthDate: null, address: null, settlementId: null, phone: null },
    educations: [],
  });
  assert.ok(result > 0 && result < 50);
});

test("academic year changes in August", () => {
  assert.equal(getCurrentAcademicYear(new Date("2026-07-31T12:00:00Z")), "2025/2026");
  assert.equal(getCurrentAcademicYear(new Date("2026-08-01T12:00:00Z")), "2026/2027");
});
