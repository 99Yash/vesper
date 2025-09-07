import { AppError, CVR, IDB_KEY, normalizeToReadonlyJSON, type IDBKeys, type MutationType, type PatchOperation } from "@vesper/models";
import { transact } from "@vesper/models/db";
import type { Note } from "@vesper/models/db/schema";
import { serverMutators } from "~/mutators";
import { ClientGroupService } from "./client-group.service";
import { ClientService } from "./client.service";

//! Make sure key have the same name as IDB_KEY
type GenPatchArgs = {
  previousCVR?: CVR;
  NOTE: {
    data: Note[];
    dels: string[];
  };
};

export class ReplicacheService {
  static genPatch(args: GenPatchArgs): PatchOperation[] {
    const patch: PatchOperation[] = [];
    const { previousCVR, ...models } = args;

    // clears the whole indexDB if previousCVR is undefined
    if (previousCVR === undefined) {
      patch.push({ op: "clear" });
    }

    Object.entries(models).forEach(([_key, { data, dels }]) => {
      const key = _key as IDBKeys;

      dels.forEach((del) =>
        patch.push({
          op: "del", // delete from indexDB if it exists
          key: IDB_KEY[key]({ id: del }),
        }),
      );
      data.forEach((datum) =>
        patch.push({
          op: "put", // put in indexDB if it doesn't exist or update if it does
          key: IDB_KEY[key]({ id: datum.id }),
          value: normalizeToReadonlyJSON(datum),
        }),
      );
    });

    return patch;
  }

  static async processMutation({
    clientGroupID,
    errorMode,
    mutation,
    userId,
  }: {
    userId: string;
    clientGroupID: string;
    mutation: MutationType;
    errorMode: boolean;
  }): Promise<void> {
    await transact(async (tx) => {
      console.info(
        `Processing mutation ${mutation.name} for user ${userId} in client group ${clientGroupID}`,
      );

      // 1. Instantiate client and client group services inside the transaction block
      const clientGroupService = new ClientGroupService(tx);
      const clientService = new ClientService(tx);

      // 2. Fetch the base client group and client
      const [baseClientGroup, baseClient] = await Promise.all([
        clientGroupService.getById({
          id: clientGroupID,
          userId,
        }),
        clientService.getById({
          id: mutation.clientID,
          clientGroupId: clientGroupID,
        }),
      ]);

      // 3. calculate the next mutation id
      const nextMutationId = baseClient.lastMutationId + 1;

      // 5. Apply the mutation if not error mode
      if (!errorMode) {
        try {
          // 4. Check if the mutation id is valid
          //#region  //*=========== Mutation id checks ===========
          // 4.1. Check if the mutation id is less --> means already processed so just return
          if (mutation.id < nextMutationId) {
            console.debug(`Skipping mutation ${mutation.id} because it has already been applied`);
            return;
          }

          // 4.2. Check if the mutation id is greater --> means future mutation so throw error
          if (mutation.id > nextMutationId) {
            console.error(
              `Mutation ${mutation.id} is too far in the future, expected ${nextMutationId}`,
            );
            throw new AppError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Mutation ${mutation.id} is too far in the future, expected ${nextMutationId}`,
            });
          }
          //#endregion  //*======== Mutation id checks ===========
          // 5.1. Check if the mutation is valid
          const mutationName = mutation.name as keyof typeof serverMutators;
          const mutator = serverMutators[mutationName];
          if (!mutator) {
            console.error(`Unknown mutation ${mutation.name}`);
            throw new Error(`Unknown mutation ${mutation.name}`);
          }
          // 5.2. Apply the mutation
          const args = mutation.args;
          await mutator({
            args,
            userId,
            tx,
          });
        } catch (error) {
          if (error instanceof AppError) {
            throw error;
          }
          console.error(error);
          throw new AppError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to apply mutation: ${mutation.name} to the server, due to an internal error. Please try again later.`,
          });
        }
      }

      // 6. Update the client with the new mutation id
      await Promise.all([
        clientGroupService.upsert({ ...baseClientGroup }),
        clientService.upsert({
          id: baseClient.id,
          clientGroupId: baseClient.clientGroupId,
          lastMutationId: nextMutationId,
        }),
      ]);

      console.info(`Mutation ${mutation.id} applied successfully`);
    });
  }
}