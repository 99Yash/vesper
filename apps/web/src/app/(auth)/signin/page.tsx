'use client';

import { redirect } from 'next/navigation';
import React from 'react';
import { authClient } from '~/lib/auth-client';
import { siteConfig } from '~/lib/site';
import { EmailSignIn } from './email-signin';
import { OAuthButtons } from './oauth-buttons';

export default function AuthenticationPage() {
  const { data: session, isPending } = authClient.useSession();

  // Use useEffect for redirect to avoid hooks order issues
  React.useEffect(() => {
    if (session && !isPending) {
      redirect('/');
    }
  }, [session, isPending]);

  // Show loading state while checking authentication
  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Loading...</div>
    </div>;
  }

  // Don't render content if we have a session (about to redirect)
  if (session) {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Redirecting...</div>
    </div>;
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] relative">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to {siteConfig.name}
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your email and password to sign in or create a new account.
        </p>
      </div>
      <div className="grid gap-6">
        <EmailSignIn />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs font-medium uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <OAuthButtons />
      </div>
      <p className="px-6 text-center text-xs text-muted-foreground">
        Copyright &copy;
        {new Date().getUTCFullYear()} {siteConfig.name} Inc. All rights
        reserved.
      </p>
    </div>
  );
}