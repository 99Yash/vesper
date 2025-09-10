"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { queryClient } from "~/utils/trpc";
import { AblyContextProvider } from "./ably-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>
					<AblyContextProvider>
					{children}
					</AblyContextProvider>
				</NuqsAdapter>
				{/* <ReactQueryDevtools /> */}
			</QueryClientProvider>
			<Toaster richColors />
		</>
	);
}
