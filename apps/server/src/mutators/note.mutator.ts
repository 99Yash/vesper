import {
  AppError,
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
  type MutatorType,
  type NoteMutators
} from "@vesper/models";
import { NoteService } from "../services/note.service";

  export const noteMutators: NoteMutators<MutatorType.SERVER> = {
  async createNote(body) {
    const { args, tx, userId } = body;

    const parsed = createNoteSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const noteService = new NoteService(tx);
    await noteService.create({ ...parsed.data, userId });
  },
  async updateNote(body) {
    const { args, tx, userId } = body;

    const parsed = updateNoteSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const noteService = new NoteService(tx);
    await noteService.update({ ...parsed.data, userId });
  },
    async deleteNote(body) {
    const { args, tx, userId } = body;

    const parsed = deleteNoteSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const noteService = new NoteService(tx);
    await noteService.delete({...parsed.data, userId });
  },
};