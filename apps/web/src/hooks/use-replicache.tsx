"use client";

import { Replicache, type M, type MutatorType, type PullerResult } from "@vesper/models/client";
import { nanoid } from "nanoid";
import React from "react";
import { toast } from "sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useAblyContext } from "~/components/ably-provider";
import { env } from "~/env";
import { authClient } from "~/lib/auth-client";
import { clientMutators } from "~/mutators";
import { trpcClient } from "~/utils/trpc";

type State = {
  // M is a type for all mutators in the app (client and server)
  rep: Replicache<M<MutatorType.CLIENT>> | null;
};

type Actions = {
  setRep: (rep: Replicache<M<MutatorType.CLIENT>>) => void;
};

const useReplicacheStore = create<State & Actions>()(
  immer((set) => ({
    rep: null,
    setRep: (rep) => set({ rep }),
  })),
);

export const useReplicache = () => {
  return { rep: useReplicacheStore((state) => state.rep) };
};

export const useLoadReplicache = () => {
  const { data } = authClient.useSession();
  
  const user = data?.user;
  
  const { rep, setRep } = useReplicacheStore((state) => state);
  const ably = useAblyContext();


  React.useEffect(() => {
    if (!user?.id || !ably) return;
    const instanceId = nanoid();

    const r = new Replicache({
      name: user.id,
      mutators: clientMutators(user.id),
      schemaVersion: env.NEXT_PUBLIC_SCHEMA_VERSION ?? "1",
    });

    r.pusher = async (opts) => {
      try {
        // Transform Replicache request to our TRPC schema format
        const transformedRequest = {
          body: {
            profileId: 'profileID' in opts ? opts.profileID : user.id,
            clientGroupId: 'clientGroupID' in opts ? opts.clientGroupID : ('clientID' in opts ? opts.clientID : ''),
            mutations: opts.mutations.map(mutation => ({
              id: mutation.id,
              name: mutation.name,
              args: mutation.args,
              timestamp: mutation.timestamp,
              clientID: 'clientID' in mutation ? mutation.clientID : undefined,
            })),
            schemaVersion: opts.schemaVersion,
          },
          instanceId: instanceId,
        };

        const response = await trpcClient.replicache.push.mutate(transformedRequest);

        if (!response.success) {
          // @ts-expect-error - error is not typed
          response.errors.forEach((error) => {
            console.error(`Error processing mutation ${error.mutationName}: ${error.errorMessage}`);
            toast.error(`Error processing mutation ${error.mutationName}: ${error.errorMessage}`);
          });
        }

        return {
          httpRequestInfo: {
            httpStatusCode: 200,
            errorMessage: "",
          },
        };
      } catch (error: unknown) {
        console.error("Push error:", error);
        return {
          httpRequestInfo: {
            httpStatusCode: 500,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    };

    r.puller = async (opts): Promise<PullerResult> => {
      try {
        // Transform Replicache request to our TRPC schema format
        const transformedRequest = {
          body: {
            profileId: 'profileID' in opts ? opts.profileID : user.id,
            clientGroupId: 'clientGroupID' in opts ? opts.clientGroupID : ('clientID' in opts ? opts.clientID : ''),
            cookie: opts.cookie && typeof opts.cookie === 'object' && 'order' in opts.cookie ? {
              order: typeof opts.cookie.order === 'number' ? opts.cookie.order : 0,
              clientGroupId: 'clientGroupID' in opts.cookie ? (opts.cookie.clientGroupID as string) : 
                             ('clientGroupId' in opts.cookie ? (opts.cookie.clientGroupId as string) : ''),
            } : null,
            schemaVersion: opts.schemaVersion,
          },
        };

        const response = await trpcClient.replicache.pull.query(transformedRequest);

        return {
          response,
          httpRequestInfo: {
            errorMessage: "",
            httpStatusCode: 200,
          },
        };
      } catch (error: unknown) {
        console.error("Pull error:", error);
        return {
          httpRequestInfo: {
            httpStatusCode: 500,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    };

    setRep(r);

    return () => {
      void r.close();
    };
  }, [setRep, user?.id]);

  React.useEffect(() => {
    if (!rep || !user?.id || !ably) return;
    const channel = ably.channels.get(`replicache:${user.id}`);
    channel.subscribe(() => {
      void rep?.pull();
    });

    return () => {
      const channel = ably.channels.get(`replicache:${user.id}`);
      channel.unsubscribe();
    };
  }, [rep, ably, user?.id]);
};