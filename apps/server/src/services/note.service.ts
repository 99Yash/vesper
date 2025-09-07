import {
  AppError,
  type SearchResult,
  type TransactionalDrizzleClient,
  type UpdateNoteType,
  and,
  db,
  eq,
  inArray
} from "@vesper/models";
import type { Note } from "@vesper/models/db/schema";
import { note } from "@vesper/models/db/schema";

/**
 * @description this class is to be used for transactional operations on the note table (todos)
 */
export class NoteService {
  constructor(private tx: TransactionalDrizzleClient) {}

  async getById({ id, userId }: { id: string; userId: string }) {
    const [existingNote] = await this.tx
      .select({
        id: note.id,
        content: note.content,
        userId: note.userId,
        files: note.files,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })
      .from(note)
      .where(and(eq(note.id, id), eq(note.userId, userId)))
      .limit(1);

    if (!existingNote) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Note not found",
      });
    }

    if (existingNote.userId !== userId) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this note",
      });
    }

    return existingNote;
  }

  async create({
    content,
    userId,
    files,
  }: {
    content: string;
    userId: string;
    files?: any[];
  }) {
    const [result] = await this.tx
      .insert(note)
      .values({
        content,
        userId,
        files,
      })
      .returning();

    return result;
  }

  async update({
    id,
    userId,
    content,
    files,
  }: UpdateNoteType & {  userId: string }) {
    const updateData: Partial<Note> = {
      updatedAt: new Date(),
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    if (files !== undefined) {
      updateData.files = files;
    }

    const [result] = await this.tx
      .update(note)
      .set(updateData)
      .where(and(eq(note.id, id), eq(note.userId, userId)))
      .returning();

    if (!result) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Note not found or you don't have permission to update it",
      });
    }

    return result;
  }

  async delete({ id, userId }: { id: string; userId: string }) {
    const [result] = await this.tx
      .delete(note)
      .where(and(eq(note.id, id), eq(note.userId, userId)))
      .returning({
        id: note.id,
      });

    if (!result) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Note not found or you don't have permission to delete it",
      });
    }

    return result;
  }

  async findMany({ ids }: { ids: string[] }): Promise<Note[]> {
    if (ids.length === 0) {
      return [];
    }

    const notes = await this.tx
      .select({
        id: note.id,
        content: note.content,
        userId: note.userId,
        files: note.files,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })
      .from(note)
      .where(inArray(note.id, ids));

    return notes;
  }

  async findMeta({ userId }: { userId: string }): Promise<SearchResult[]> {
    const notes = await this.tx
      .select({
        id: note.id,
        updatedAt: note.updatedAt,
      })
      .from(note)
      .where(eq(note.userId, userId));

    return notes.map((noteRecord) => ({
      id: noteRecord.id,
      rowVersion: noteRecord.updatedAt ? noteRecord.updatedAt.getTime() : 0,
    }));
  }
}

/**
 * @description this constant is an instance of the TodoService class, and should be used for non transactional operations
 * on the note table
 */
export const noteService = new NoteService(db as any);
