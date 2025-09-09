"use client";

import type { ErrorInfo, Realtime } from "ably";
import * as React from "react";
import { authClient } from "~/lib/auth-client";
import { trpcClient } from "~/utils/trpc";

const AblyContext = React.createContext<Realtime | null>(null);
AblyContext.displayName = "AblyContext";

export const AblyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [ablyClient, setAblyClient] = React.useState<Realtime | null>(null);
  const [ablyLoaded, setAblyLoaded] = React.useState(false);

  // Load Ably dynamically to avoid server-side dependencies
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    import("ably").then((ably) => {
      // Store the Realtime class for later use
      (window as any).AblyRealtime = ably.Realtime;
      setAblyLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    if (!userId || isPending || !ablyLoaded || typeof window === "undefined") {
      return;
    }

    const createClient = async () => {
      try {
        const AblyRealtime = (window as any).AblyRealtime as typeof Realtime;
        
        const client = new AblyRealtime({
          authCallback: async (_tokenParams, callback) => {
            try {
              // Use TRPC to get the auth token
              const token = await trpcClient.socket.getToken.query();
              callback(null, token);
            } catch (error) {
              console.error("Failed to get Ably token:", error);
              callback(error as ErrorInfo, null);
            }
          },
          autoConnect: true,
          closeOnUnload: true,
          clientId: userId,
        });

        setAblyClient(client);
      } catch (error) {
        console.error("Failed to create Ably client:", error);
      }
    };

    void createClient();

    return () => {
      setAblyClient((prevClient) => {
        if (prevClient) {
          prevClient.close();
        }
        return null;
      });
    };
  }, [isPending, userId, ablyLoaded]);

  return (
    <AblyContext.Provider value={ablyClient}>{children}</AblyContext.Provider>
  );
};

/**
 * Custom hook to access the Ably client
 * @returns The Ably Realtime client or null if not yet initialized
 */
export const useAblyContext = (): Realtime | null => {
  return React.useContext(AblyContext);
};