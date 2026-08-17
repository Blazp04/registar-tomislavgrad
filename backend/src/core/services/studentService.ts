import type {
  ConsentDTO,
  DataRequestDTO,
  DataRequestResolutionDTO,
  EducationDTO,
  ScholarshipDTO,
  StudentQueryDTO,
  UpdateProfileDTO,
} from "../../dto/student.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { calculateProfileCompletion, getCurrentAcademicYear } from "../utils/profileCompletion.js";
import { auditService } from "./auditService.js";

async function getProfileOrThrowByUser(userId: string) {
  const profile = await studentRepository.ensureProfile(userId);
  if (!profile) throw new NotFoundError("Profil nije pronađen");
  return profile;
}

async function getProfileOrThrowById(profileId: string) {
  const record = await studentRepository.findProfileById(profileId);
  if (!record) throw new NotFoundError("Profil nije pronađen");
  const profile = await studentRepository.findProfileByUserId(record.userId);
  if (!profile) throw new NotFoundError("Profil nije pronađen");
  return profile;
}

async function refreshCompletion(userId: string) {
  const profile = await getProfileOrThrowByUser(userId);
  const educations = await studentRepository.listEducations(profile.id);
  const completion = calculateProfileCompletion({
    user: profile,
    profile,
    educations,
  });
  await studentRepository.updateCompletion(profile.id, completion);
  return completion;
}

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

export const studentService = {
  async getOwnBundle(userId: string) {
    const profile = await getProfileOrThrowByUser(userId);
    const [educations, scholarships, consents, dataRequests] = await Promise.all([
      studentRepository.listEducations(profile.id),
      studentRepository.listScholarships(profile.id),
      studentRepository.listConsents(userId),
      studentRepository.listOwnDataRequests(userId),
    ]);
    return { profile, educations, scholarships, consents, dataRequests, currentAcademicYear: getCurrentAcademicYear() };
  },

  async getOwnDashboard(userId: string) {
    const bundle = await this.getOwnBundle(userId);
    const currentStudy = bundle.educations.find((item) => item.type === "higher_education" && item.isCurrent)
      ?? bundle.educations.find((item) => item.type === "higher_education")
      ?? null;
    return {
      greetingName: bundle.profile.firstName,
      completionPercentage: bundle.profile.completionPercentage,
      currentStudy,
      verifiedAcademicYear: bundle.profile.verifiedAcademicYear,
      currentAcademicYear: bundle.currentAcademicYear,
      needsConfirmation: bundle.profile.verifiedAcademicYear !== bundle.currentAcademicYear,
      scholarships: bundle.scholarships,
      lastUpdatedAt: bundle.profile.updatedAt,
    };
  },

  async updateOwnProfile(userId: string, data: UpdateProfileDTO) {
    await getProfileOrThrowByUser(userId);
    await studentRepository.updateProfile(userId, data);
    await refreshCompletion(userId);
    return getProfileOrThrowByUser(userId);
  },

  async createEducation(userId: string, data: EducationDTO) {
    const profile = await getProfileOrThrowByUser(userId);
    const item = await studentRepository.createEducation(profile.id, data);
    await refreshCompletion(userId);
    return item;
  },

  async updateEducation(userId: string, id: string, data: EducationDTO) {
    const profile = await getProfileOrThrowByUser(userId);
    const existing = await studentRepository.findEducation(id, profile.id);
    if (!existing) throw new NotFoundError("Zapis obrazovanja nije pronađen");
    const item = await studentRepository.updateEducation(id, profile.id, data);
    await refreshCompletion(userId);
    return item;
  },

  async deleteEducation(userId: string, id: string) {
    const profile = await getProfileOrThrowByUser(userId);
    const existing = await studentRepository.findEducation(id, profile.id);
    if (!existing) throw new NotFoundError("Zapis obrazovanja nije pronađen");
    const item = await studentRepository.deleteEducation(id, profile.id);
    await refreshCompletion(userId);
    return item;
  },

  async confirmOwnProfile(userId: string) {
    const profile = await getProfileOrThrowByUser(userId);
    const completion = await refreshCompletion(userId);
    if (completion < 100) throw new BadRequestError("Profil je potrebno dovršiti prije potvrde podataka");
    return studentRepository.verifyProfile(profile.id, getCurrentAcademicYear());
  },

  async recordConsent(userId: string, data: ConsentDTO, ipAddress?: string | null) {
    return studentRepository.recordConsent({ userId, ...data, ipAddress: ipAddress ?? null });
  },

  async createDataRequest(userId: string, email: string, data: DataRequestDTO) {
    return studentRepository.createDataRequest({ userId, requesterEmail: email, ...data });
  },

  async exportOwnData(userId: string) {
    const bundle = await this.getOwnBundle(userId);
    return {
      exportedAt: new Date().toISOString(),
      controller: "Općina Tomislavgrad",
      ...bundle,
    };
  },

  async deactivateOwnAccount(userId: string, ipAddress?: string | null) {
    const before = await studentRepository.findProfileByUserId(userId);
    const updated = await studentRepository.updateAccountStatus(userId, false);
    await auditService.record({ actorId: userId, subjectUserId: userId, action: "account.deactivate", entityType: "user", entityId: userId, before, after: { isActive: false }, ipAddress });
    return updated;
  },

  listStudents(filters: StudentQueryDTO) {
    return studentRepository.findAll(filters);
  },

  async getAdminStudent(profileId: string) {
    const profile = await getProfileOrThrowById(profileId);
    const [educations, scholarships, consents, dataRequests] = await Promise.all([
      studentRepository.listEducations(profile.id),
      studentRepository.listScholarships(profile.id),
      studentRepository.listConsents(profile.userId),
      studentRepository.listOwnDataRequests(profile.userId),
    ]);
    return { profile, educations, scholarships, consents, dataRequests };
  },

  async verifyStudent(profileId: string, academicYear: string, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const completion = await refreshCompletion(profile.userId);
    if (completion < 100) throw new BadRequestError("Profil je potrebno dovršiti prije administrativne potvrde");
    const updated = await studentRepository.verifyProfile(profileId, academicYear);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "profile.verify", entityType: "student_profile", entityId: profileId, before: { verifiedAcademicYear: profile.verifiedAcademicYear }, after: updated, ipAddress });
    return updated;
  },

  async adminUpdateProfile(profileId: string, data: UpdateProfileDTO, adminId: string, ipAddress?: string | null) {
    const before = await getProfileOrThrowById(profileId);
    await studentRepository.updateProfile(before.userId, data);
    await refreshCompletion(before.userId);
    const updated = await getProfileOrThrowByUser(before.userId);
    await auditService.record({ actorId: adminId, subjectUserId: before.userId, action: "profile.update", entityType: "student_profile", entityId: profileId, before, after: updated, ipAddress });
    return updated;
  },

  async adminCreateEducation(profileId: string, data: EducationDTO, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const item = await studentRepository.createEducation(profileId, data);
    await refreshCompletion(profile.userId);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "education.create", entityType: "student_education", entityId: item.id, after: item, ipAddress });
    return item;
  },

  async adminUpdateEducation(profileId: string, id: string, data: EducationDTO, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const before = await studentRepository.findEducation(id, profileId);
    if (!before) throw new NotFoundError("Zapis obrazovanja nije pronađen");
    const item = await studentRepository.updateEducation(id, profileId, data);
    await refreshCompletion(profile.userId);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "education.update", entityType: "student_education", entityId: id, before, after: item, ipAddress });
    return item;
  },

  async adminDeleteEducation(profileId: string, id: string, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const before = await studentRepository.findEducation(id, profileId);
    if (!before) throw new NotFoundError("Zapis obrazovanja nije pronađen");
    const item = await studentRepository.deleteEducation(id, profileId);
    await refreshCompletion(profile.userId);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "education.delete", entityType: "student_education", entityId: id, before, ipAddress });
    return item;
  },

  async createScholarship(profileId: string, data: ScholarshipDTO, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const item = await studentRepository.createScholarship(profileId, data, adminId);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "scholarship.create", entityType: "scholarship", entityId: item.id, after: item, ipAddress });
    return item;
  },

  async updateScholarship(id: string, data: ScholarshipDTO, adminId: string, ipAddress?: string | null) {
    const before = await studentRepository.findScholarship(id);
    if (!before) throw new NotFoundError("Stipendija nije pronađena");
    const profile = await getProfileOrThrowById(before.profileId);
    const item = await studentRepository.updateScholarship(id, data, adminId);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "scholarship.update", entityType: "scholarship", entityId: id, before, after: item, ipAddress });
    return item;
  },

  async deleteScholarship(id: string, adminId: string, ipAddress?: string | null) {
    const before = await studentRepository.findScholarship(id);
    if (!before) throw new NotFoundError("Stipendija nije pronađena");
    const profile = await getProfileOrThrowById(before.profileId);
    const item = await studentRepository.deleteScholarship(id);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: "scholarship.delete", entityType: "scholarship", entityId: id, before, ipAddress });
    return item;
  },

  getStats() {
    return studentRepository.getStats(getCurrentAcademicYear());
  },

  async exportFilteredStudents(filters: StudentQueryDTO) {
    const result = await studentRepository.findAll({ ...filters, page: 1, limit: 10_000 });
    const headers = ["Ime", "Prezime", "E-mail", "Grad studiranja", "Fakultet", "Studijski program", "Godina studija", "Status studija", "Dovršenost profila", "Potvrđena akademska godina", "Zadnje ažuriranje"];
    const rows = result.items.map((item) => [
      item.firstName,
      item.lastName,
      item.email,
      item.cityName,
      item.facultyName,
      item.studyProgramName,
      item.currentStudyYear,
      item.studyStatus,
      `${item.completionPercentage}%`,
      item.verifiedAcademicYear,
      item.updatedAt.toISOString(),
    ]);
    return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}`;
  },

  listDataRequests(status?: "submitted" | "in_review" | "completed" | "rejected") {
    return studentRepository.listDataRequests(status);
  },

  async resolveDataRequest(id: string, data: DataRequestResolutionDTO, adminId: string, ipAddress?: string | null) {
    const before = await studentRepository.findDataRequest(id);
    if (!before) throw new NotFoundError("Zahtjev nije pronađen");
    const updated = await studentRepository.resolveDataRequest(id, data.status, data.resolutionNote, adminId);
    await auditService.record({ actorId: adminId, subjectUserId: before.userId, action: "data_request.resolve", entityType: "data_request", entityId: id, before, after: updated, ipAddress });
    return updated;
  },

  async updateAccountStatus(profileId: string, isActive: boolean, adminId: string, ipAddress?: string | null) {
    const profile = await getProfileOrThrowById(profileId);
    const updated = await studentRepository.updateAccountStatus(profile.userId, isActive);
    await auditService.record({ actorId: adminId, subjectUserId: profile.userId, action: isActive ? "account.activate" : "account.deactivate", entityType: "user", entityId: profile.userId, before: { isActive: profile.isActive }, after: { isActive }, ipAddress });
    return updated;
  },

  listAuditLogs(page: number, limit: number, subjectUserId?: string) {
    return studentRepository.listAuditLogs(page, limit, subjectUserId);
  },
};
