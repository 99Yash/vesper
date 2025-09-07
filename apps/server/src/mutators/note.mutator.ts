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
    await noteService.create({ ...args, userId });
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
    await noteService.update({ ...args, userId });
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
    await noteService.delete({...args, userId });
  },
};