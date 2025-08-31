'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '~/lib/auth-client';
import { OAuthButtons } from './oauth-buttons';

export default function AuthenticationPage() {
  const { data } = authClient.useSession();
  const router = useRouter();

  if (data?.user) {
    router.push('/');
  }


  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
				Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Select an authentication method to continue
        </p>
      </div>
      <div className="grid gap-6">
          <>
            <div className="space-y-1">
              <OAuthButtons />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            {/* <div className="space-y-1">
              <EmailSignIn
                onSuccess={(email: string) => {
                  setEmail(email);
                  setStep('verify');
                }}
              />
            </div> */}
          </>

      </div>
    </div>
  );
}