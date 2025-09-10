import type { M, MutatorType } from "@vesper/models/client";
import { clientNoteMutators } from "./note.mutator";

export const clientMutators:(userId: string) => M<MutatorType.CLIENT> = (userId) => {
  return {
    ...clientNoteMutators(userId),
  };
};