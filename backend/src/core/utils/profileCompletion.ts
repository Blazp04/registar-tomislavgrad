export interface CompletionInput {
  user: { firstName?: string | null; lastName?: string | null; email?: string | null };
  profile: { birthDate?: string | null; address?: string | null; settlementId?: string | null; phone?: string | null };
  educations: Array<Record<string, unknown> & { type: "high_school" | "higher_education" }>;
}

export function calculateProfileCompletion(input: CompletionInput): number {
  const personal = [
    input.user.firstName,
    input.user.lastName,
    input.user.email,
    input.profile.birthDate,
    input.profile.address,
    input.profile.settlementId,
    input.profile.phone,
  ];
  const highSchool = input.educations.find((item) => item.type === "high_school");
  const higherEducation = input.educations.find((item) => item.type === "higher_education" && item.isCurrent === true)
    ?? input.educations.find((item) => item.type === "higher_education");

  const highSchoolFields = highSchool
    ? [highSchool.highSchoolId, highSchool.cityId, highSchool.highSchoolProgram, highSchool.graduationYear]
    : [null, null, null, null];
  const studyFields = higherEducation
    ? [
        higherEducation.countryId,
        higherEducation.cityId,
        higherEducation.universityId,
        higherEducation.facultyId,
        higherEducation.studyProgramId,
        higherEducation.studyLevelId,
        higherEducation.studyMode,
        higherEducation.firstEnrollmentYear,
        higherEducation.currentStudyYear,
        higherEducation.expectedGraduationYear,
        higherEducation.studyStatus,
      ]
    : Array.from({ length: 11 }, () => null);

  const fields = [...personal, ...highSchoolFields, ...studyFields];
  const completed = fields.filter((value) => value !== null && value !== undefined && value !== "").length;
  return Math.round((completed / fields.length) * 100);
}

export function getCurrentAcademicYear(now = new Date()): string {
  const year = now.getFullYear();
  const startsThisYear = now.getMonth() >= 7;
  const first = startsThisYear ? year : year - 1;
  return `${first}/${first + 1}`;
}
