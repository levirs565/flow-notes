import * as z from "zod";

export const listQuerySchema = z.object({
  archived: z.stringbool().optional(),
  q: z.string().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export const updateRequestSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
});

export type UpdateRequest = z.infer<typeof updateRequestSchema>;

export const idParametersSchema = z.object({
  id: z.coerce.number(),
});

export const patchArchivedSchema = z.object({
  archived: z.boolean(),
});
