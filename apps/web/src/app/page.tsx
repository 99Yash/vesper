"use client";

import { redirect } from "next/navigation";
import React from "react";
import { Button } from "~/components/ui/button";
import { authClient } from "../lib/auth-client";

export default function Home() {
	const { data, isPending } = authClient.useSession();

	// Use useEffect for redirect to avoid hooks order issues
	React.useEffect(() => {
		if (!(data || isPending)) {
			redirect("/signin");
		}
	}, [data, isPending]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Loading...</div>
			</div>
		);
	}

	// Don't render content if no session (about to redirect)
	if (!data) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Redirecting to sign in...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${data.user ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="text-muted-foreground text-sm">
							{data.user.name}
						</span>
					</div>
					<div className="flex items-center gap-2">
						{data?.user && (
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span className="text-muted-foreground text-sm">
									{data.user.email}
								</span>

								<Button onClick={() => authClient.signOut()} variant="outline">
									Sign Out
								</Button>
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
