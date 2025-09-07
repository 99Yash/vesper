"use client";


import Ably from "ably";
import * as React from "react";
import { authClient } from "~/lib/auth-client";

const AblyContext = React.createContext<Ably.Realtime | null>(null);
AblyContext.displayName = "AblyContext";

export const AblyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session,isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [ablyClient, setAblyClient] = React.useState<Ably.Realtime | null>(
    null,
  );

  React.useEffect(() => {
    if (!userId || isPending || typeof window === "undefined") {
      return;
    }

    const createClient = async () => {
      try {
        const client = new Ably.Realtime({
          authUrl: "/api/ably",
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
  }, [isPending, userId]);

  return (
    <AblyContext.Provider value={ablyClient}>{children}</AblyContext.Provider>
  );
};

/**
 * Custom hook to access the Ably client
 * @returns The Ably Realtime client or null if not yet initialized
 */
export const useAblyContext = (): Ably.Realtime | null => {
  return React.useContext(AblyContext);
};