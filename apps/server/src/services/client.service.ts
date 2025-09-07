import {
	AppError,
	type SearchResult,
	type TransactionalDrizzleClient,
	and,
	db,
	eq,
} from "@vesper/models";
import { client } from "@vesper/models/db/schema";

/**
 * @description this class is to be used for transactional operations on the client table
 */
export class ClientService {
  constructor(private tx: TransactionalDrizzleClient) {}

  async getById({ id, clientGroupId }: { id: string; clientGroupId: string }) {
    const [existingClient] = await this.tx
      .select({
        id: client.id,
        clientGroupId: client.clientGroupId,
        lastMutationId: client.lastMutationId,
      })
      .from(client)
      .where(and(eq(client.id, id), eq(client.clientGroupId, clientGroupId)))
      .limit(1);

    if (!existingClient) {
      return {
        id,
        clientGroupId,
        lastMutationId: 0,
      };
    }

    if (existingClient.clientGroupId !== clientGroupId) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this client",
      });
    }

    return existingClient;
  }

  async upsert({
    id,
    clientGroupId,
    lastMutationId,
    name,
    userId,
  }: {
    id: string;
    clientGroupId: string;
    lastMutationId: number;
    name?: string;
    userId?: string;
  }) {
    await this.tx
      .insert(client)
      .values({
        id,
        clientGroupId,
        lastMutationId,
        name: name ?? `Client ${id}`, // Use provided name or default
        userId: userId ?? "system", // Use provided userId or default to system
      })
      .onConflictDoUpdate({
        target: [client.id, client.clientGroupId],
        set: {
          lastMutationId: lastMutationId,
        },
      })
      .returning({
        id: client.id,
      });
  }

  async findMeta({ clientGroupId }: { clientGroupId: string }): Promise<SearchResult[]> {
    const clients = await this.tx
      .select({
        id: client.id,
        lastMutationId: client.lastMutationId,
      })
      .from(client)
      .where(eq(client.clientGroupId, clientGroupId));

    return clients.map((clientRecord) => ({
      id: clientRecord.id,
      rowVersion: clientRecord.lastMutationId,
    }));
  }
}

/**
 * @description this constant is an instance of the ClientService class, and should be used for non transactional operations
 * on the client table
 */
export const clientService = new ClientService(db as any);