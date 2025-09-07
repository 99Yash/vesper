"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import type { AuthOptionsType } from "~/lib/constants";
import {
	getErrorMessage,
	getLocalStorageItem,
	setLocalStorageItem,
} from "~/lib/utils";

const schema = z.object({
	email: z
		.email("Please enter a valid email address")
		.max(100, "Email must be less than 100 characters"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(128, "Password must be less than 128 characters"),
	name: z.string().optional(),
});

type EmailSignInProps = {
	onSuccess?: () => void;
};

export function EmailSignIn({ onSuccess }: EmailSignInProps = {}) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: session } = authClient.useSession();

	const [lastAuthMethod, setLastAuthMethod] =
		React.useState<AuthOptionsType | null>(null);

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			const lastAuthMethod = getLocalStorageItem("LAST_AUTH_METHOD");
			setLastAuthMethod(lastAuthMethod ?? null);
		}
	}, []);

	const loginMutation = useMutation({
		mutationFn: async ({
			email,
			password,
			name,
		}: {
			email: string;
			password: string;
			name?: string;
		}) => {
			// Strategy: Try sign-up first, then fall back to sign-in
			// Better Auth returns { data, error } objects, not thrown exceptions
			console.log("Attempting sign up first...");
			const signUpResult = await authClient.signUp.email({
				email,
				password,
				name: name || email.split("@")[0]!, // Use email prefix as fallback name
			});

			// Check if sign-up was successful
			if (signUpResult.data && !signUpResult.error) {
				console.log("✅ Sign up successful:", signUpResult);
				return { result: signUpResult, isNewUser: true };
			}

			const signInResult = await authClient.signIn.email({
				email,
				password,
			});

			if (signInResult.data && !signInResult.error) {
				return { result: signInResult, isNewUser: false };
			}

			throw new Error(signInResult.error?.message || "Authentication failed");
		},
		onError(error) {
			console.error("🚨 Final login mutation error:", error);
			toast.error(getErrorMessage(error));
		},
		onSuccess(data) {
			if (typeof window !== "undefined") {
				setLocalStorageItem("LAST_AUTH_METHOD", "email");
			}

			toast.success("Successfully signed in!");
			onSuccess?.();
			router.push("/");
		},
	});

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const { success, data, error } = schema.safeParse(
			Object.fromEntries(formData)
		);

		if (!success) {
			const firstError = error.issues[0];
			toast.error(firstError?.message || "Please check your input");
			return;
		}

		await loginMutation.mutateAsync({
			email: data.email,
			password: data.password,
			name: data.name,
		});
	}

	return (
		<form className="grid gap-4" onSubmit={handleSubmit}>
			<div className="grid gap-2">
				<Input
					autoCapitalize="none"
					autoComplete="email"
					autoCorrect="off"
					className="bg-background"
					name="email"
					placeholder={session?.user?.email || "name@example.com"}
					required
					type="email"
				/>
				<Input
					autoComplete="current-password"
					className="bg-background"
					name="password"
					placeholder="Password"
					required
					type="password"
				/>
			</div>
			<Button
				className="relative"
				disabled={loginMutation.isPending}
				type="submit"
			>
				{loginMutation.isPending ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					"Continue with Email"
				)}
				{lastAuthMethod === "email" && (
					<i className="-right-0.5 -top-2 absolute rounded bg-blue-500 px-1 py-0.5 text-center text-blue-50 text-xs">
						Last used
					</i>
				)}
			</Button>
		</form>
	);
}
