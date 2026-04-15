import { eq, and, isNull, ilike, sql, count, asc, desc, inArray, type SQL } from "drizzle-orm";
import { db } from "../database/db.js";
import { student } from "../database/student-schema.js";
import { codebook } from "../database/codebook-schema.js";

const notDeleted = isNull(student.deletedAt);

export const studentRepository = {
  async findById(id: string) {
    const result = await db
      .select({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        fatherName: student.fatherName,
        email: student.email,
        address: student.address,
        phone: student.phone,
        isCurrentStudent: student.isCurrentStudent,
        isEmployed: student.isEmployed,
        isWorkingInField: student.isWorkingInField,
        highSchoolType: student.highSchoolType,
        highSchoolDuration: student.highSchoolDuration,
        highSchoolProfessionId: student.highSchoolProfessionId,
        highSchoolCityId: student.highSchoolCityId,
        facultyId: student.facultyId,
        fieldOfStudyId: student.fieldOfStudyId,
        facultyCityId: student.facultyCityId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      })
      .from(student)
      .where(and(eq(student.id, id), notDeleted))
      .limit(1);
    return result[0] ?? null;
  },

  async findByIdWithCodebooks(id: string) {
    const result = await db
      .select({
        student: student,
        facultyName: sql<string>`faculty_cb.name`.as("faculty_name"),
        fieldOfStudyName: sql<string>`field_cb.name`.as("field_of_study_name"),
        highSchoolProfessionName: sql<string>`hs_prof_cb.name`.as("high_school_profession_name"),
        highSchoolCityName: sql<string>`hs_city_cb.name`.as("high_school_city_name"),
        facultyCityName: sql<string>`fac_city_cb.name`.as("faculty_city_name"),
      })
      .from(student)
      .innerJoin(sql`${codebook} as faculty_cb`, sql`${student.facultyId} = faculty_cb.id`)
      .innerJoin(sql`${codebook} as field_cb`, sql`${student.fieldOfStudyId} = field_cb.id`)
      .leftJoin(sql`${codebook} as hs_prof_cb`, sql`${student.highSchoolProfessionId} = hs_prof_cb.id`)
      .innerJoin(sql`${codebook} as hs_city_cb`, sql`${student.highSchoolCityId} = hs_city_cb.id`)
      .innerJoin(sql`${codebook} as fac_city_cb`, sql`${student.facultyCityId} = fac_city_cb.id`)
      .where(and(eq(student.id, id), notDeleted))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0].student,
      facultyName: result[0].facultyName,
      fieldOfStudyName: result[0].fieldOfStudyName,
      highSchoolProfessionName: result[0].highSchoolProfessionName,
      highSchoolCityName: result[0].highSchoolCityName,
      facultyCityName: result[0].facultyCityName,
    };
  },

  async findAll(filters?: {
    search?: string;
    facultyId?: string;
    fieldOfStudyId?: string;
    isCurrentStudent?: boolean;
    isEmployed?: boolean;
    isWorkingInField?: boolean;
    page?: number;
    limit?: number;
    sort?: "lastName" | "firstName" | "facultyName" | "fieldOfStudyName" | "createdAt";
    order?: "asc" | "desc";
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [notDeleted];

    if (filters?.search) {
      const search = `%${filters.search}%`;
      conditions.push(
        sql`(${ilike(student.firstName, search)} OR ${ilike(student.lastName, search)})`
      );
    }
    if (filters?.facultyId) {
      conditions.push(eq(student.facultyId, filters.facultyId));
    }
    if (filters?.fieldOfStudyId) {
      conditions.push(eq(student.fieldOfStudyId, filters.fieldOfStudyId));
    }
    if (filters?.isCurrentStudent !== undefined) {
      conditions.push(eq(student.isCurrentStudent, filters.isCurrentStudent));
    }
    if (filters?.isEmployed !== undefined) {
      conditions.push(eq(student.isEmployed, filters.isEmployed));
    }
    if (filters?.isWorkingInField !== undefined) {
      conditions.push(eq(student.isWorkingInField, filters.isWorkingInField));
    }

    const where = and(...conditions);

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          fatherName: student.fatherName,
          email: student.email,
          address: student.address,
          phone: student.phone,
          isCurrentStudent: student.isCurrentStudent,
          isEmployed: student.isEmployed,
          isWorkingInField: student.isWorkingInField,
          highSchoolType: student.highSchoolType,
          highSchoolDuration: student.highSchoolDuration,
          highSchoolProfessionId: student.highSchoolProfessionId,
          highSchoolCityId: student.highSchoolCityId,
          facultyId: student.facultyId,
          fieldOfStudyId: student.fieldOfStudyId,
          facultyCityId: student.facultyCityId,
          facultyName: sql<string>`faculty_cb.name`.as("faculty_name"),
          fieldOfStudyName: sql<string>`field_cb.name`.as("field_of_study_name"),
          highSchoolProfessionName: sql<string>`hs_prof_cb.name`.as("high_school_profession_name"),
          highSchoolCityName: sql<string>`hs_city_cb.name`.as("high_school_city_name"),
          facultyCityName: sql<string>`fac_city_cb.name`.as("faculty_city_name"),
          createdAt: student.createdAt,
        })
        .from(student)
        .innerJoin(sql`${codebook} as faculty_cb`, sql`${student.facultyId} = faculty_cb.id`)
        .innerJoin(sql`${codebook} as field_cb`, sql`${student.fieldOfStudyId} = field_cb.id`)
        .leftJoin(sql`${codebook} as hs_prof_cb`, sql`${student.highSchoolProfessionId} = hs_prof_cb.id`)
        .innerJoin(sql`${codebook} as hs_city_cb`, sql`${student.highSchoolCityId} = hs_city_cb.id`)
        .innerJoin(sql`${codebook} as fac_city_cb`, sql`${student.facultyCityId} = fac_city_cb.id`)
        .where(where)
        .orderBy((() => {
          const dir = filters?.order === "desc" ? desc : asc;
          const sortColumnMap = {
            lastName: student.lastName,
            firstName: student.firstName,
            facultyName: sql`faculty_cb.name`,
            fieldOfStudyName: sql`field_cb.name`,
            createdAt: student.createdAt,
          } as const;
          const col = filters?.sort ? sortColumnMap[filters.sort] : student.lastName;
          return dir(col);
        })())
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(student)
        .where(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  async create(data: {
    firstName: string;
    lastName: string;
    fatherName: string;
    email: string;
    address: string;
    phone: string;
    isCurrentStudent: boolean;
    isEmployed: boolean;
    isWorkingInField?: boolean;
    highSchoolType: "gimnazija" | "strukovna";
    highSchoolDuration: "trogodisnja" | "cetverogodisnja" | "petogodisnja";
    highSchoolProfessionId?: string | null;
    highSchoolCityId: string;
    facultyId: string;
    fieldOfStudyId: string;
    facultyCityId: string;
    createdBy?: string;
  }) {
    const result = await db.insert(student).values({
      firstName: data.firstName,
      lastName: data.lastName,
      fatherName: data.fatherName,
      email: data.email,
      address: data.address,
      phone: data.phone,
      isCurrentStudent: data.isCurrentStudent,
      isEmployed: data.isEmployed,
      isWorkingInField: data.isWorkingInField ?? false,
      highSchoolType: data.highSchoolType,
      highSchoolDuration: data.highSchoolDuration,
      highSchoolProfessionId: data.highSchoolProfessionId ?? null,
      highSchoolCityId: data.highSchoolCityId,
      facultyId: data.facultyId,
      fieldOfStudyId: data.fieldOfStudyId,
      facultyCityId: data.facultyCityId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    }).returning();
    return result[0];
  },

  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    fatherName: string;
    address: string;
    phone: string;
    isCurrentStudent: boolean;
    isEmployed: boolean;
    isWorkingInField: boolean;
    highSchoolType: "gimnazija" | "strukovna";
    highSchoolDuration: "trogodisnja" | "cetverogodisnja" | "petogodisnja";
    highSchoolProfessionId: string | null;
    highSchoolCityId: string;
    facultyId: string;
    fieldOfStudyId: string;
    facultyCityId: string;
    updatedBy: string;
  }>) {
    const result = await db
      .update(student)
      .set(data)
      .where(and(eq(student.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },

  async softDelete(id: string, deletedBy?: string) {
    const result = await db
      .update(student)
      .set({ deletedAt: new Date(), deletedBy })
      .where(and(eq(student.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },

  async getStats() {
    const [totalResult] = await db
      .select({ total: count() })
      .from(student)
      .where(notDeleted);

    const [currentResult] = await db
      .select({ total: count() })
      .from(student)
      .where(and(notDeleted, eq(student.isCurrentStudent, true)));

    const [employedResult] = await db
      .select({ total: count() })
      .from(student)
      .where(and(notDeleted, eq(student.isEmployed, true)));

    const [workingInFieldResult] = await db
      .select({ total: count() })
      .from(student)
      .where(and(notDeleted, eq(student.isEmployed, true), eq(student.isWorkingInField, true)));

    const facultyStats = await db
      .select({
        facultyId: student.facultyId,
        facultyName: sql<string>`faculty_cb.name`,
        count: count(),
      })
      .from(student)
      .innerJoin(sql`${codebook} as faculty_cb`, sql`${student.facultyId} = faculty_cb.id`)
      .where(notDeleted)
      .groupBy(student.facultyId, sql`faculty_cb.name`)
      .orderBy(sql`count(*) desc`);

    const fieldStats = await db
      .select({
        fieldOfStudyId: student.fieldOfStudyId,
        fieldOfStudyName: sql<string>`field_cb.name`,
        count: count(),
      })
      .from(student)
      .innerJoin(sql`${codebook} as field_cb`, sql`${student.fieldOfStudyId} = field_cb.id`)
      .where(notDeleted)
      .groupBy(student.fieldOfStudyId, sql`field_cb.name`)
      .orderBy(sql`count(*) desc`);

    return {
      total: totalResult.total,
      currentStudents: currentResult.total,
      formerStudents: totalResult.total - currentResult.total,
      employed: employedResult.total,
      unemployed: totalResult.total - employedResult.total,
      workingInField: workingInFieldResult.total,
      notWorkingInField: employedResult.total - workingInFieldResult.total,
      byFaculty: facultyStats,
      byFieldOfStudy: fieldStats,
    };
  },

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return db
      .select({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
      })
      .from(student)
      .where(and(
        inArray(student.id, ids),
        notDeleted,
      ));
  },
};
