import z from "zod";

export const storedFileSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.url(),
});

export type StoredFile = z.infer<typeof storedFileSchema>;

export const createNoteSchema = z.object({
	id: z.string(),
	content: z.string(),
	files: z.array(storedFileSchema).optional(),
});

export type CreateNoteType = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
	id: z.string(),
	content: z.string().optional(),
	files: z.array(storedFileSchema).optional(),
});

export type UpdateNoteType = z.infer<typeof updateNoteSchema>;

export const deleteNoteSchema = z.object({
	id: z.string(),
});

export type DeleteNoteType = z.infer<typeof deleteNoteSchema>;