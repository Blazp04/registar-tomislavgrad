import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { EducationDTO, ScholarshipDTO, StudentQueryDTO, UpdateProfileDTO } from "../../dto/student.js";
import { user } from "../database/auth-schema.js";
import { codebook } from "../database/codebook-schema.js";
import { db } from "../database/db.js";
import { getCurrentAcademicYear } from "../utils/profileCompletion.js";
import {
  auditLog,
  consent,
  dataRequest,
  scholarship,
  studentEducation,
  studentProfile,
} from "../database/student-schema.js";

const codebookName = (idColumn: unknown) => sql<string | null>`(
  select cb.name from codebooks cb where cb.id = ${idColumn} and cb.deleted_at is null limit 1
)`;

export const studentRepository = {
  async ensureProfile(userId: string) {
    await db.insert(studentProfile).values({ userId }).onConflictDoNothing();
    return this.findProfileByUserId(userId);
  },

  async findProfileByUserId(userId: string) {
    const [result] = await db
      .select({
        id: studentProfile.id,
        userId: studentProfile.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        birthDate: studentProfile.birthDate,
        address: studentProfile.address,
        settlementId: studentProfile.settlementId,
        settlementName: codebookName(studentProfile.settlementId),
        phone: studentProfile.phone,
        completionPercentage: studentProfile.completionPercentage,
        verifiedAcademicYear: studentProfile.verifiedAcademicYear,
        verifiedAt: studentProfile.verifiedAt,
        createdAt: studentProfile.createdAt,
        updatedAt: studentProfile.updatedAt,
      })
      .from(studentProfile)
      .innerJoin(user, eq(studentProfile.userId, user.id))
      .where(eq(studentProfile.userId, userId))
      .limit(1);
    return result ?? null;
  },

  async findProfileById(profileId: string) {
    const [result] = await db.select().from(studentProfile).where(eq(studentProfile.id, profileId)).limit(1);
    return result ?? null;
  },

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const { firstName, lastName, ...profileData } = data;
    return db.transaction(async (tx) => {
      if (firstName !== undefined || lastName !== undefined) {
        const [currentUser] = await tx.select({ firstName: user.firstName, lastName: user.lastName }).from(user).where(eq(user.id, userId)).limit(1);
        if (!currentUser) return null;
        const nextFirstName = firstName ?? currentUser.firstName;
        const nextLastName = lastName ?? currentUser.lastName;
        await tx.update(user).set({ firstName: nextFirstName, lastName: nextLastName, name: `${nextFirstName} ${nextLastName}`, updatedAt: new Date() }).where(eq(user.id, userId));
      }
      const [result] = await tx
        .update(studentProfile)
        .set({ ...profileData, updatedAt: new Date(), verifiedAcademicYear: null, verifiedAt: null })
        .where(eq(studentProfile.userId, userId))
        .returning();
      return result ?? null;
    });
  },

  async updateCompletion(profileId: string, completionPercentage: number) {
    await db.update(studentProfile).set({ completionPercentage, updatedAt: new Date() }).where(eq(studentProfile.id, profileId));
  },

  async verifyProfile(profileId: string, academicYear: string) {
    const [result] = await db
      .update(studentProfile)
      .set({ verifiedAcademicYear: academicYear, verifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(studentProfile.id, profileId))
      .returning();
    return result ?? null;
  },

  async listEducations(profileId: string) {
    return db
      .select({
        id: studentEducation.id,
        profileId: studentEducation.profileId,
        type: studentEducation.type,
        countryId: studentEducation.countryId,
        countryName: codebookName(studentEducation.countryId),
        cityId: studentEducation.cityId,
        cityName: codebookName(studentEducation.cityId),
        highSchoolId: studentEducation.highSchoolId,
        highSchoolName: codebookName(studentEducation.highSchoolId),
        highSchoolProgram: studentEducation.highSchoolProgram,
        graduationYear: studentEducation.graduationYear,
        universityId: studentEducation.universityId,
        universityName: codebookName(studentEducation.universityId),
        facultyId: studentEducation.facultyId,
        facultyName: codebookName(studentEducation.facultyId),
        studyProgramId: studentEducation.studyProgramId,
        studyProgramName: codebookName(studentEducation.studyProgramId),
        studyLevelId: studentEducation.studyLevelId,
        studyLevelName: codebookName(studentEducation.studyLevelId),
        studyMode: studentEducation.studyMode,
        firstEnrollmentYear: studentEducation.firstEnrollmentYear,
        currentStudyYear: studentEducation.currentStudyYear,
        expectedGraduationYear: studentEducation.expectedGraduationYear,
        studyStatus: studentEducation.studyStatus,
        isCurrent: studentEducation.isCurrent,
        createdAt: studentEducation.createdAt,
        updatedAt: studentEducation.updatedAt,
      })
      .from(studentEducation)
      .where(eq(studentEducation.profileId, profileId))
      .orderBy(desc(studentEducation.isCurrent), desc(studentEducation.firstEnrollmentYear), desc(studentEducation.graduationYear));
  },

  async findEducation(id: string, profileId?: string) {
    const [item] = await db
      .select()
      .from(studentEducation)
      .where(and(eq(studentEducation.id, id), profileId ? eq(studentEducation.profileId, profileId) : undefined))
      .limit(1);
    return item ?? null;
  },

  async createEducation(profileId: string, data: EducationDTO) {
    return db.transaction(async (tx) => {
      if (data.type === "higher_education" && data.isCurrent) {
        await tx.update(studentEducation).set({ isCurrent: false }).where(and(eq(studentEducation.profileId, profileId), eq(studentEducation.type, "higher_education")));
      }
      const [item] = await tx.insert(studentEducation).values({ ...data, profileId }).returning();
      await tx.update(studentProfile).set({ updatedAt: new Date(), verifiedAcademicYear: null, verifiedAt: null }).where(eq(studentProfile.id, profileId));
      return item;
    });
  },

  async updateEducation(id: string, profileId: string, data: EducationDTO) {
    return db.transaction(async (tx) => {
      if (data.type === "higher_education" && data.isCurrent) {
        await tx.update(studentEducation).set({ isCurrent: false }).where(and(eq(studentEducation.profileId, profileId), eq(studentEducation.type, "higher_education"), ne(studentEducation.id, id)));
      }
      const [item] = await tx.update(studentEducation).set({ ...data, updatedAt: new Date() }).where(and(eq(studentEducation.id, id), eq(studentEducation.profileId, profileId))).returning();
      await tx.update(studentProfile).set({ updatedAt: new Date(), verifiedAcademicYear: null, verifiedAt: null }).where(eq(studentProfile.id, profileId));
      return item ?? null;
    });
  },

  async deleteEducation(id: string, profileId: string) {
    return db.transaction(async (tx) => {
      const [item] = await tx.delete(studentEducation).where(and(eq(studentEducation.id, id), eq(studentEducation.profileId, profileId))).returning();
      await tx.update(studentProfile).set({ updatedAt: new Date(), verifiedAcademicYear: null, verifiedAt: null }).where(eq(studentProfile.id, profileId));
      return item ?? null;
    });
  },

  async listScholarships(profileId: string) {
    return db
      .select({
        id: scholarship.id,
        profileId: scholarship.profileId,
        name: scholarship.name,
        scholarshipTypeId: scholarship.scholarshipTypeId,
        scholarshipTypeName: codebookName(scholarship.scholarshipTypeId),
        providerId: scholarship.providerId,
        providerName: codebookName(scholarship.providerId),
        academicYear: scholarship.academicYear,
        status: scholarship.status,
        startDate: scholarship.startDate,
        endDate: scholarship.endDate,
        amount: scholarship.amount,
        currency: scholarship.currency,
        adminNote: scholarship.adminNote,
        createdAt: scholarship.createdAt,
        updatedAt: scholarship.updatedAt,
      })
      .from(scholarship)
      .where(eq(scholarship.profileId, profileId))
      .orderBy(desc(scholarship.academicYear), desc(scholarship.createdAt));
  },

  async findScholarship(id: string) {
    const [item] = await db.select().from(scholarship).where(eq(scholarship.id, id)).limit(1);
    return item ?? null;
  },

  async createScholarship(profileId: string, data: ScholarshipDTO, adminId: string) {
    const [item] = await db.insert(scholarship).values({
      ...data,
      amount: data.amount === null || data.amount === undefined ? null : String(data.amount),
      profileId,
      createdBy: adminId,
      updatedBy: adminId,
    }).returning();
    return item;
  },

  async updateScholarship(id: string, data: ScholarshipDTO, adminId: string) {
    const [item] = await db.update(scholarship).set({
      ...data,
      amount: data.amount === null || data.amount === undefined ? null : String(data.amount),
      updatedBy: adminId,
      updatedAt: new Date(),
    }).where(eq(scholarship.id, id)).returning();
    return item ?? null;
  },

  async deleteScholarship(id: string) {
    const [item] = await db.delete(scholarship).where(eq(scholarship.id, id)).returning();
    return item ?? null;
  },

  async listConsents(userId: string) {
    return db.select().from(consent).where(eq(consent.userId, userId)).orderBy(desc(consent.acceptedAt));
  },

  async recordConsent(data: typeof consent.$inferInsert) {
    if (!data.accepted && data.type === "optional_updates") {
      await db.update(consent).set({ withdrawnAt: new Date() }).where(and(eq(consent.userId, data.userId), eq(consent.type, data.type), isNull(consent.withdrawnAt)));
    }
    const [item] = await db.insert(consent).values(data).returning();
    return item;
  },

  async createDataRequest(values: typeof dataRequest.$inferInsert) {
    const [item] = await db.insert(dataRequest).values(values).returning();
    return item;
  },

  async listOwnDataRequests(userId: string) {
    return db.select().from(dataRequest).where(eq(dataRequest.userId, userId)).orderBy(desc(dataRequest.createdAt));
  },

  async listDataRequests(status?: "submitted" | "in_review" | "completed" | "rejected") {
    return db.select().from(dataRequest).where(status ? eq(dataRequest.status, status) : undefined).orderBy(desc(dataRequest.createdAt));
  },

  async findDataRequest(id: string) {
    const [item] = await db.select().from(dataRequest).where(eq(dataRequest.id, id)).limit(1);
    return item ?? null;
  },

  async resolveDataRequest(id: string, status: "in_review" | "completed" | "rejected", resolutionNote: string | null | undefined, adminId: string) {
    const [item] = await db.update(dataRequest).set({
      status,
      resolutionNote,
      resolvedAt: status === "completed" || status === "rejected" ? new Date() : null,
      resolvedBy: adminId,
    }).where(eq(dataRequest.id, id)).returning();
    return item ?? null;
  },

  async findAll(filters: StudentQueryDTO) {
    const conditions: SQL[] = [eq(user.role, "student")];
    if (filters.search) {
      const value = `%${filters.search}%`;
      conditions.push(or(ilike(user.firstName, value), ilike(user.lastName, value), ilike(user.email, value))!);
    }
    if (filters.cityId) conditions.push(sql`exists(select 1 from student_educations e where e.profile_id = ${studentProfile.id} and e.city_id = ${filters.cityId})`);
    if (filters.facultyId) conditions.push(sql`exists(select 1 from student_educations e where e.profile_id = ${studentProfile.id} and e.faculty_id = ${filters.facultyId})`);
    if (filters.studyProgramId) conditions.push(sql`exists(select 1 from student_educations e where e.profile_id = ${studentProfile.id} and e.study_program_id = ${filters.studyProgramId})`);
    if (filters.currentStudyYear) conditions.push(sql`exists(select 1 from student_educations e where e.profile_id = ${studentProfile.id} and e.current_study_year = ${filters.currentStudyYear})`);
    if (filters.studyStatus) conditions.push(sql`exists(select 1 from student_educations e where e.profile_id = ${studentProfile.id} and e.study_status = ${filters.studyStatus})`);
    if (filters.academicYear) conditions.push(sql`exists(select 1 from scholarships s where s.profile_id = ${studentProfile.id} and s.academic_year = ${filters.academicYear})`);
    if (filters.scholarshipTypeId) conditions.push(sql`exists(select 1 from scholarships s where s.profile_id = ${studentProfile.id} and s.scholarship_type_id = ${filters.scholarshipTypeId})`);
    if (filters.scholarshipStatus) conditions.push(sql`exists(select 1 from scholarships s where s.profile_id = ${studentProfile.id} and s.status = ${filters.scholarshipStatus})`);
    if (filters.updatedBefore) conditions.push(lt(studentProfile.updatedAt, new Date(filters.updatedBefore)));
    if (filters.updatedAfter) conditions.push(sql`${studentProfile.updatedAt} >= ${new Date(filters.updatedAfter)}`);
    // Matches getStats(): "verified" means confirmed for the current academic year
    if (filters.verification === "verified") conditions.push(eq(studentProfile.verifiedAcademicYear, getCurrentAcademicYear()));
    if (filters.verification === "unverified") conditions.push(sql`${studentProfile.verifiedAcademicYear} is distinct from ${getCurrentAcademicYear()}`);

    const sortMap = {
      lastName: user.lastName,
      firstName: user.firstName,
      updatedAt: studentProfile.updatedAt,
      completionPercentage: studentProfile.completionPercentage,
    } as const;
    const direction = filters.order === "desc" ? desc : asc;
    const where = and(...conditions);
    const offset = (filters.page - 1) * filters.limit;

    const [items, [totalRow]] = await Promise.all([
      db.select({
        id: studentProfile.id,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        completionPercentage: studentProfile.completionPercentage,
        verifiedAcademicYear: studentProfile.verifiedAcademicYear,
        updatedAt: studentProfile.updatedAt,
        cityName: sql<string | null>`(select cb.name from student_educations e left join codebooks cb on cb.id=e.city_id where e.profile_id=${studentProfile.id} and e.type='higher_education' order by e.is_current desc, e.created_at desc limit 1)`,
        facultyName: sql<string | null>`(select cb.name from student_educations e left join codebooks cb on cb.id=e.faculty_id where e.profile_id=${studentProfile.id} and e.type='higher_education' order by e.is_current desc, e.created_at desc limit 1)`,
        studyProgramName: sql<string | null>`(select cb.name from student_educations e left join codebooks cb on cb.id=e.study_program_id where e.profile_id=${studentProfile.id} and e.type='higher_education' order by e.is_current desc, e.created_at desc limit 1)`,
        currentStudyYear: sql<number | null>`(select e.current_study_year from student_educations e where e.profile_id=${studentProfile.id} and e.type='higher_education' order by e.is_current desc, e.created_at desc limit 1)`,
        studyStatus: sql<string | null>`(select e.study_status from student_educations e where e.profile_id=${studentProfile.id} and e.type='higher_education' order by e.is_current desc, e.created_at desc limit 1)`,
        scholarshipCount: sql<number>`(select count(*)::int from scholarships s where s.profile_id=${studentProfile.id})`,
      }).from(studentProfile).innerJoin(user, eq(studentProfile.userId, user.id)).where(where)
        .orderBy(direction(sortMap[filters.sort]), asc(user.lastName)).limit(filters.limit).offset(offset),
      db.select({ total: count() }).from(studentProfile).innerJoin(user, eq(studentProfile.userId, user.id)).where(where),
    ]);
    const total = totalRow?.total ?? 0;
    const totalPages = Math.ceil(total / filters.limit);
    return {
      items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1,
      },
    };
  },

  async getStats(currentAcademicYear: string) {
    const staleCutoff = new Date();
    staleCutoff.setFullYear(staleCutoff.getFullYear() - 1);

    const [totals, byCity, byFaculty, byProgram, byStudyYear, scholarshipByYear, scholarshipByType, scholarshipByStatus] = await Promise.all([
      db.select({
        total: countDistinct(studentProfile.id),
        active: sql<number>`count(distinct ${studentProfile.id}) filter (where exists(select 1 from student_educations e where e.profile_id=${studentProfile.id} and e.study_status='active'))::int`,
        completed: sql<number>`count(distinct ${studentProfile.id}) filter (where exists(select 1 from student_educations e where e.profile_id=${studentProfile.id} and e.study_status='completed'))::int`,
        unverified: sql<number>`count(distinct ${studentProfile.id}) filter (where ${studentProfile.verifiedAcademicYear} is distinct from ${currentAcademicYear})::int`,
        stale: sql<number>`count(distinct ${studentProfile.id}) filter (where ${lt(studentProfile.updatedAt, staleCutoff)})::int`,
      }).from(studentProfile).innerJoin(user, eq(studentProfile.userId, user.id)).where(eq(user.role, "student")),
      db.select({ name: codebook.name, count: countDistinct(studentEducation.profileId) }).from(studentEducation).innerJoin(codebook, eq(studentEducation.cityId, codebook.id)).where(eq(studentEducation.type, "higher_education")).groupBy(codebook.name).orderBy(desc(countDistinct(studentEducation.profileId))),
      db.select({ name: codebook.name, count: countDistinct(studentEducation.profileId) }).from(studentEducation).innerJoin(codebook, eq(studentEducation.facultyId, codebook.id)).where(eq(studentEducation.type, "higher_education")).groupBy(codebook.name).orderBy(desc(countDistinct(studentEducation.profileId))),
      db.select({ name: codebook.name, count: countDistinct(studentEducation.profileId) }).from(studentEducation).innerJoin(codebook, eq(studentEducation.studyProgramId, codebook.id)).where(eq(studentEducation.type, "higher_education")).groupBy(codebook.name).orderBy(desc(countDistinct(studentEducation.profileId))),
      db.select({ name: studentEducation.currentStudyYear, count: countDistinct(studentEducation.profileId) }).from(studentEducation).where(eq(studentEducation.type, "higher_education")).groupBy(studentEducation.currentStudyYear).orderBy(asc(studentEducation.currentStudyYear)),
      db.select({ name: scholarship.academicYear, count: countDistinct(scholarship.profileId) }).from(scholarship).groupBy(scholarship.academicYear).orderBy(desc(scholarship.academicYear)),
      db.select({
        name: sql<string>`coalesce(${codebook.name}, ${scholarship.name}, 'Bez vrste')`,
        count: count(),
      }).from(scholarship).leftJoin(codebook, eq(scholarship.scholarshipTypeId, codebook.id)).groupBy(codebook.name, scholarship.name).orderBy(desc(count())),
      db.select({ name: scholarship.status, count: count() }).from(scholarship).groupBy(scholarship.status).orderBy(desc(count())),
    ]);

    return { ...(totals[0] ?? { total: 0, active: 0, completed: 0, unverified: 0, stale: 0 }), byCity, byFaculty, byProgram, byStudyYear, scholarshipByYear, scholarshipByType, scholarshipByStatus };
  },

  async updateAccountStatus(userId: string, isActive: boolean) {
    const [updated] = await db.update(user).set({ isActive, updatedAt: new Date() }).where(eq(user.id, userId)).returning();
    return updated ?? null;
  },

  async listAuditLogs(page: number, limit: number, subjectUserId?: string) {
    const offset = (page - 1) * limit;
    const subjectFilter = subjectUserId ? eq(auditLog.subjectUserId, subjectUserId) : undefined;
    const [items, [totalRow]] = await Promise.all([
      db.select({
        id: auditLog.id,
        actorId: auditLog.actorId,
        actorName: sql<string | null>`(select concat(u.first_name, ' ', u.last_name) from "user" u where u.id=${auditLog.actorId})`,
        subjectUserId: auditLog.subjectUserId,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        createdAt: auditLog.createdAt,
      }).from(auditLog).where(subjectFilter).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(auditLog).where(subjectFilter),
    ]);
    const total = totalRow?.total ?? 0;
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } };
  },
};
