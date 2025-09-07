import { Optional } from "utility-types";
import { Client, ClientGroup } from "../db/schema/clients";

export type ClientCreateArgs = Omit<Client, "lastMutationId" | "updatedAt">;

export type ClientUpdateArgs = Omit<Client, "clientGroupId" | "updatedAt">;

export type ClientCreateIfNotExistsType = {
  id: string;
  clientGroupId: string;
};

export type ClientFindManyByClientGroupIdType = {
  clientGroupId: string;
  sinceClientVersion: number;
};


export type ClientGroupUpdateArgs = Omit<
  Optional<ClientGroup, "cvrVersion">,
  "userId" | "lastModified"
>;