import { notificationRepository } from "../repositories/notificationRepository.js";

export const notificationService = {
  async getByStudentId(studentId: string, page?: number, limit?: number) {
    return notificationRepository.findByStudentId(studentId, { page, limit });
  },

  async logNotifications(records: Array<{
    studentId: string;
    type: "email" | "sms";
    subject?: string | null;
    content: string;
    sentBy?: string | null;
  }>) {
    return notificationRepository.createMany(records);
  },
};
