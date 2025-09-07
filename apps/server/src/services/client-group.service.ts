import {
	AppError,
	type SearchResult,
	type TransactionalDrizzleClient,
	and,
	db,
	eq,
} from "@vesper/models";
import { client_group } from "@vesper/models/db/schema";

/**
 * @description this class is to be used for transactional operations on the client_group table
 */
export class ClientGroupService {
  constructor(private tx: TransactionalDrizzleClient) {}

  async getById({ id, userId }: { id: string; userId: string }) {
    const [existingClientGroup] = await this.tx
      .select({
        id: client_group.id,
        name: client_group.name,
        userId: client_group.userId,
        cvrVersion: client_group.cvrVersion,
        lastSyncedAt: client_group.lastSyncedAt,
        createdAt: client_group.createdAt,
        updatedAt: client_group.updatedAt,
      })
      .from(client_group)
      .where(and(eq(client_group.id, id), eq(client_group.userId, userId)))
      .limit(1);

    if (!existingClientGroup) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Client group not found",
      });
    }

    if (existingClientGroup.userId !== userId) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this client group",
      });
    }

    return existingClientGroup;
  }

  async upsert({
    id,
    name,
    userId,
    cvrVersion,
  }: {
    id: string;
    name?: string;
    userId: string;
    cvrVersion: number;
  }) {
    const [result] = await this.tx
      .insert(client_group)
      .values({
        id,
        name: name ?? `Client Group ${id}`,
        userId,
        cvrVersion,
      })
      .onConflictDoUpdate({
        target: [client_group.id, client_group.userId],
        set: {
          cvrVersion: cvrVersion,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: client_group.id,
        name: client_group.name,
        userId: client_group.userId,
        cvrVersion: client_group.cvrVersion,
        lastSyncedAt: client_group.lastSyncedAt,
        createdAt: client_group.createdAt,
        updatedAt: client_group.updatedAt,
      });

    return result;
  }

  async findMeta({ userId }: { userId: string }): Promise<SearchResult[]> {
    const clientGroups = await this.tx
      .select({
        id: client_group.id,
        cvrVersion: client_group.cvrVersion,
      })
      .from(client_group)
      .where(eq(client_group.userId, userId));

    return clientGroups.map((clientGroupRecord) => ({
      id: clientGroupRecord.id,
      rowVersion: clientGroupRecord.cvrVersion,
    }));
  }
}

/**
 * @description this constant is an instance of the ClientGroupService class, and should be used for non transactional operations
 * on the client_group table
 */
export const clientGroupService = new ClientGroupService(db as any);
