import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./apiClient";

export interface NotificationItem {
  id: string;
  type: "email" | "sms";
  subject: string | null;
  content: string;
  sentAt: string;
  senderName: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useStudentNotifications(studentId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", studentId, page, limit],
    queryFn: () =>
      apiFetch<{ success: boolean; data: NotificationItem[]; meta: PaginationMeta }>(
        `/api/students/${studentId}/notifications?page=${page}&limit=${limit}`
      ).then((r) => ({ items: r.data, meta: r.meta })),
    enabled: !!studentId,
  });
}
