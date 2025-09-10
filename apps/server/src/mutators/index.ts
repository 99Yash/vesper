import type { M, MutatorType } from "@vesper/models";
import { noteMutators } from "./note.mutator";

export const serverMutators: M<MutatorType.SERVER> = {
  ...noteMutators,
};