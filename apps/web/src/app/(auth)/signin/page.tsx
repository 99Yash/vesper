'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '~/lib/auth-client';
import { siteConfig } from '~/lib/site';
import { OAuthButtons } from './oauth-buttons';

export default function AuthenticationPage() {
  const { data } = authClient.useSession();
  const router = useRouter();

  if (data?.user) {
    router.push('/');
  }


  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] relative">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to {siteConfig.name}
        </h1>
        {/* <p className="text-xs text-muted-foreground">
          If you sign in via email, we&apos;ll send you a verification link.
        </p> */}
      </div>
      <div className="grid gap-6">
        {/* <EmailSignIn /> */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs font-medium uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Select a sign-in method
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