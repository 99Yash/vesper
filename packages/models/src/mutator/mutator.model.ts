import { type WriteTransaction } from "replicache";
import { TransactionalDrizzleClient } from "..";
import { NoteMutators } from "./note.model";

export type MutatorContext = {
  userId: string;
};

export type MutatorTypes = MutatorType.CLIENT | MutatorType.SERVER;

export enum MutatorType {
  CLIENT = "client",
  SERVER = "server",
}

export type Mutator<Type = MutatorTypes, Args = object> = Type extends MutatorType.CLIENT
  ? (tx: WriteTransaction, args: Args) => Promise<void>
  : (
      body: {
        tx: TransactionalDrizzleClient;
        args: Args;
      } & MutatorContext,
    ) => Promise<void>;

// As the number of mutators grows, we can add more types here. like `& MoreMutators<Type>`
export type M<Type = MutatorTypes> = NoteMutators<Type>;