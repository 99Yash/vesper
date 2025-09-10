import {
  IDB_KEY,
  type CreateNoteType,
  type ReadTransaction,
  type UpdateNoteType,
} from "@vesper/models/client";
import type { Note } from "@vesper/models/db/schema";

import { normalizeReplicacheData } from "~/lib/replicache";

export class NoteManager {
  static createNote(args: CreateNoteType & { userId: string }) {
    const note = {
      id: args.id,
      content: args.content,
      rowVersion: 0,
      files: args.files ?? null,
      userId: args.userId,
    };
    return note;
  }

  static async getNoteById({ id, tx }: { id: string; tx: ReadTransaction }) {
    const todo = (await tx.get(IDB_KEY.NOTE({ id: id }))) as Note | undefined;
    return todo;
  }

  static updateNote({ oldNote, args }: { oldNote: Note; args: UpdateNoteType }) {
    return {
      ...oldNote,
      content: args.content,
      files: args.files,
    } as Note;
  }

  static async getAllNotes({ tx }: { tx: ReadTransaction }) {
    const _notes = await tx
      .scan({
        prefix: IDB_KEY.NOTE({}),
      })
      .entries()
      .toArray();

    const notes = normalizeReplicacheData<Note>(_notes);
    return notes;
  }
}	