import { z } from "zod";
import { ValidationError } from "./errors.js";

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  const fields: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".") || "_root";
    fields[path] ??= [];
    fields[path].push(issue.message);
  }
  throw new ValidationError("Provjerite unesene podatke", fields);
}
