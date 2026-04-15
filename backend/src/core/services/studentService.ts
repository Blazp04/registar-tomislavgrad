import { studentRepository } from "../repositories/studentRepository.js";
import { codebookService } from "./codebookService.js";
import { notificationService } from "./notificationService.js";
import { NotFoundError } from "../utils/errors.js";
import type { CreateStudentDTO, UpdateStudentDTO, StudentQueryDTO, SendSmsDTO, SendEmailDTO } from "../../dto/student.js";
import { sendEmail } from "../../lib/email.js";

export const studentService = {
  async getById(id: string) {
    const result = await studentRepository.findByIdWithCodebooks(id);
    if (!result) throw new NotFoundError("Student nije pronađen");
    return result;
  },

  async getAll(filters: StudentQueryDTO) {
    return studentRepository.findAll(filters);
  },

  async create(data: CreateStudentDTO, userId?: string) {
    let { facultyId, fieldOfStudyId, highSchoolProfessionId, highSchoolCityId, facultyCityId } = data;

    // Handle "Drugo" option for faculty
    if (data.customFacultyName) {
      const faculty = await codebookService.findOrCreate("faculty", data.customFacultyName, userId);
      facultyId = faculty.id;
    }

    // Handle "Drugo" option for field of study
    if (data.customFieldOfStudyName) {
      const field = await codebookService.findOrCreate("field_of_study", data.customFieldOfStudyName, userId);
      fieldOfStudyId = field.id;
    }

    // Handle "Drugo" option for high school profession
    if (data.customHighSchoolProfessionName) {
      const prof = await codebookService.findOrCreate("high_school_profession", data.customHighSchoolProfessionName, userId);
      highSchoolProfessionId = prof.id;
    }

    // Handle "Drugo" option for city
    if (data.customCityName) {
      const city = await codebookService.findOrCreate("city", data.customCityName, userId);
      highSchoolCityId = city.id;
      facultyCityId = city.id;
    }

    // Gimnazija is always 4-year, no profession
    const highSchoolType = data.highSchoolType;
    const highSchoolDuration = highSchoolType === "gimnazija" ? "cetverogodisnja" as const : data.highSchoolDuration;
    const resolvedProfessionId = highSchoolType === "gimnazija" ? null : (highSchoolProfessionId ?? null);

    return studentRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      fatherName: data.fatherName,
      email: data.email,
      address: data.address,
      phone: data.phone,
      isCurrentStudent: data.isCurrentStudent,
      isEmployed: data.isEmployed,
      isWorkingInField: data.isWorkingInField,
      highSchoolType,
      highSchoolDuration,
      highSchoolProfessionId: resolvedProfessionId,
      highSchoolCityId,
      facultyId,
      fieldOfStudyId,
      facultyCityId,
      createdBy: userId,
    });
  },

  async update(id: string, data: UpdateStudentDTO, userId?: string) {
    const existing = await studentRepository.findById(id);
    if (!existing) throw new NotFoundError("Student nije pronađen");

    const updateData: Record<string, unknown> = { ...data, updatedBy: userId };
    delete updateData.customFacultyName;
    delete updateData.customFieldOfStudyName;
    delete updateData.customHighSchoolProfessionName;
    delete updateData.customCityName;

    if (data.customFacultyName) {
      const faculty = await codebookService.findOrCreate("faculty", data.customFacultyName, userId);
      updateData.facultyId = faculty.id;
    }

    if (data.customFieldOfStudyName) {
      const field = await codebookService.findOrCreate("field_of_study", data.customFieldOfStudyName, userId);
      updateData.fieldOfStudyId = field.id;
    }

    if (data.customHighSchoolProfessionName) {
      const prof = await codebookService.findOrCreate("high_school_profession", data.customHighSchoolProfessionName, userId);
      updateData.highSchoolProfessionId = prof.id;
    }

    if (data.customCityName) {
      const city = await codebookService.findOrCreate("city", data.customCityName, userId);
      updateData.highSchoolCityId = city.id;
      updateData.facultyCityId = city.id;
    }

    // Enforce Gimnazija rules on update
    if (data.highSchoolType === "gimnazija") {
      updateData.highSchoolDuration = "cetverogodisnja";
      updateData.highSchoolProfessionId = null;
    }

    return studentRepository.update(id, updateData);
  },

  async remove(id: string, userId?: string) {
    const existing = await studentRepository.findById(id);
    if (!existing) throw new NotFoundError("Student nije pronađen");
    return studentRepository.softDelete(id, userId);
  },

  async getStats() {
    return studentRepository.getStats();
  },

  async sendBulkSms(data: SendSmsDTO, userId?: string) {
    const students = await studentRepository.findByIds(data.studentIds);

    const messages = students.map((s) => {
      const message = data.messageTemplate
        .replace(/\{ime\}/gi, s.firstName)
        .replace(/\{prezime\}/gi, s.lastName);

      return {
        phone: s.phone,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        message,
      };
    });

    // Print to console instead of actual SMS API
    console.log("=== SMS PORUKE ===");
    for (const msg of messages) {
      console.log(`\nPrimalac: ${msg.studentName} (${msg.phone})`);
      console.log(`Poruka: ${msg.message}`);
      console.log("---");
    }
    console.log(`\nUkupno poruka: ${messages.length}`);
    console.log("=== KRAJ ===\n");

    // Log notifications to database
    await notificationService.logNotifications(
      messages.map((m) => ({
        studentId: m.studentId,
        type: "sms" as const,
        content: m.message,
        sentBy: userId ?? null,
      }))
    );

    return {
      sent: messages.length,
      messages,
    };
  },

  async sendBulkEmail(data: SendEmailDTO, userId?: string) {
    const students = await studentRepository.findByIds(data.studentIds);

    const results = [];
    const notificationRecords: Array<{ studentId: string; type: "email"; subject: string; content: string; sentBy: string | null }> = [];

    for (const s of students) {
      const messageBody = data.messageTemplate
        .replace(/\{ime\}/gi, s.firstName)
        .replace(/\{prezime\}/gi, s.lastName);

      let success = false;
      try {
        success = await sendEmail({
          to: s.email,
          subject: data.subject,
          firstName: s.firstName,
          lastName: s.lastName,
          messageBody,
        });
      } catch (err) {
        console.error(`Failed to send email to ${s.email}:`, err);
      }

      results.push({
        email: s.email,
        studentName: `${s.firstName} ${s.lastName}`,
        success,
      });

      notificationRecords.push({
        studentId: s.id,
        type: "email" as const,
        subject: data.subject,
        content: messageBody,
        sentBy: userId ?? null,
      });
    }

    // Log notifications to database
    await notificationService.logNotifications(notificationRecords);

    return {
      sent: results.filter((r) => r.success).length,
      total: results.length,
      results,
    };
  },
};
