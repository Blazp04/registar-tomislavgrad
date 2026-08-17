import { z } from "zod";
import { codebookTypeValues } from "../core/database/codebook-schema.js";

export const codebookTypeSchema = z.enum(codebookTypeValues);

export const createCodebookSchema = z.object({
  type: codebookTypeSchema,
  name: z.string().trim().min(2).max(255),
  isOfficial: z.boolean().default(true),
});

export const updateCodebookSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  isOfficial: z.boolean().optional(),
}).refine((value) => value.name !== undefined || value.isOfficial !== undefined, {
  message: "Potrebno je poslati barem jednu promjenu",
});

export type CreateCodebookDTO = z.infer<typeof createCodebookSchema>;
export type UpdateCodebookDTO = z.infer<typeof updateCodebookSchema>;
