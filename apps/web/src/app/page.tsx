"use client";

import { redirect } from "next/navigation";
import React from "react";
import { NotesPage } from "~/components/notes-page";
import { Button } from "~/components/ui/button";
import { useLoadReplicache } from "~/hooks/use-replicache";
import { authClient } from "../lib/auth-client";

export default function Home() {
	const { data, isPending } = authClient.useSession();
	
	// Initialize Replicache when user is authenticated
	useLoadReplicache();

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
		<div className="min-h-screen bg-background">
			{/* Header with user info */}
			<header className="border-b">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						<h1 className="text-xl font-semibold">Vesper</h1>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span className="text-sm text-muted-foreground">
								{data.user.name}
							</span>
						</div>
					</div>
					<Button onClick={() => authClient.signOut()} variant="outline" size="sm">
						Sign Out
					</Button>
				</div>
			</header>

			{/* Main content */}
			<main>
				<NotesPage />
			</main>
		</div>
	);
}
