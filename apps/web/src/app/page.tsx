"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { trpc } from "~/utils/trpc";
import { authClient } from '../lib/auth-client';


export default function Home() {
	const { data } = authClient.useSession();
	if (!data)  {
		redirect("/signin");
	}
	const healthCheck = useQuery(trpc.privateData.queryOptions(undefined,{
		refetchOnWindowFocus: false,
	}));

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${healthCheck.isSuccess ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="text-sm text-muted-foreground">
							{healthCheck.isPending
								? "Checking..."
								: healthCheck.isSuccess
									? "Connected"
									: "Disconnected"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						{
							data?.user && (
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-green-500" />
									<span className="text-sm text-muted-foreground">
										{data.user.email}
									</span>

									<Button variant="outline" onClick={() => authClient.signOut()}>Sign Out</Button>
								</div>
							)
						}
					</div>
				</section>
			</div>
		</div>
	);
}
