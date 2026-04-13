import { z } from "zod";

export const createCodebookSchema = z.object({
  type: z.enum(["faculty", "field_of_study", "high_school_profession", "city"]),
  name: z.string().min(2).max(255),
});

export const updateCodebookSchema = z.object({
  name: z.string().min(2).max(255),
});

export type CreateCodebookDTO = z.infer<typeof createCodebookSchema>;
export type UpdateCodebookDTO = z.infer<typeof updateCodebookSchema>;
