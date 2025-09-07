import {
  IDB_KEY,
  type MutatorType,
  normalizeToReadonlyJSON,
  type NoteMutators,
} from "@vesper/models/client";
import { NoteManager } from "~/managers/note.manager";

export const clientNoteMutators: (userId: string) => NoteMutators<MutatorType.CLIENT> = (
  userId,
) => ({
  async createNote(tx, args) {
    const note = NoteManager.createNote({
      ...args,
      userId,
    });

    await tx.set(IDB_KEY.NOTE({ id: args.id }), normalizeToReadonlyJSON(note));
  },
  async deleteNote(tx, args) {
    const note = await NoteManager.getNoteById({
      id: args.id,
      tx,
    });

    if (note === undefined) {
      throw new Error(`Note with id ${args.id} not found`);
    }

    await tx.del(IDB_KEY.NOTE({ id: args.id }));
  },
  async updateNote(tx, args) {
    const note = await NoteManager.getNoteById({
      id: args.id,
      tx,
    });

    if (note === undefined) {
      throw new Error(`Note with id ${args.id} not found`);
    }

    // should never happen, as in every user's indexDB resides data that only that user has access to
    	if (note.userId !== userId) {
      throw new Error(`Note with id ${args.id} not found`);
    }

    const updatedNote = NoteManager.updateNote({
      args,
      oldNote: note,
    });
    await tx.set(IDB_KEY.NOTE({ id: args.id }), normalizeToReadonlyJSON(updatedNote));
  },
});