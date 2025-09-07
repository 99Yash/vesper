import type { M, MutatorType } from "@vesper/models";
import { clientNoteMutators } from "~/mutators/note.mutator";

export const clientManagers: (userId: string) => M<MutatorType.CLIENT> = (userId) => ({
  ...clientNoteMutators(userId),
});