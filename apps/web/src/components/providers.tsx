"use client";

import { queryClient } from "@/utils/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				{children}
				{/* <ReactQueryDevtools /> */}
			</QueryClientProvider>
			<Toaster richColors />
		</>
	);
}
