"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { queryClient } from "~/utils/trpc";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				 <NuqsAdapter>{children}</NuqsAdapter>
				{/* <ReactQueryDevtools /> */}
			</QueryClientProvider>
			<Toaster richColors />
		</>
	);
}
