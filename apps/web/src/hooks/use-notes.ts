import { type CreateNoteType, type DeleteNoteType, type UpdateNoteType } from "@vesper/models";
import type { Note } from "@vesper/models/db/schema";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useSubscribe } from "replicache-react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import { NoteManager } from "~/managers/note.manager";
import { useReplicache } from "./use-replicache";

export const useNotes = () => {
  const { rep } = useReplicache();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // Use useSubscribe for automatic subscription management
  const notes = useSubscribe(
    rep,
    async (tx) => {
      const notesData = await NoteManager.getAllNotes({ tx });
      return notesData.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    },
    {
      default: [] as Note[],
      dependencies: [userId],
    }
  );

  const isLoading = !rep || !userId;

  // Create note mutation
  const createNote = useCallback(
    async (data: Omit<CreateNoteType, "id">) => {
      if (!rep) {
        toast.error("Not connected to sync service");
        return false;
      }

      try {
        const id = nanoid();
        await rep.mutate.createNote({ id, ...data });
        toast.success("Note created successfully");
        return true;
      } catch (error) {
        console.error("Failed to create note:", error);
        toast.error("Failed to create note");
        return false;
      }
    },
    [rep]
  );

  // Update note mutation
  const updateNote = useCallback(
    async (data: UpdateNoteType) => {
      if (!rep) {
        toast.error("Not connected to sync service");
        return false;
      }

      try {
        await rep.mutate.updateNote(data);
        toast.success("Note updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to update note:", error);
        toast.error("Failed to update note");
        return false;
      }
    },
    [rep]
  );

  // Delete note mutation
  const deleteNote = useCallback(
    async (data: DeleteNoteType) => {
      if (!rep) {
        toast.error("Not connected to sync service");
        return false;
      }

      try {
        await rep.mutate.deleteNote(data);
        toast.success("Note deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete note:", error);
        toast.error("Failed to delete note");
        return false;
      }
    },
    [rep]
  );

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
  };
};
