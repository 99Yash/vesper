'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { authClient } from '~/lib/auth-client';
import type { AuthOptionsType } from '~/lib/constants';
import {
  getErrorMessage,
  getLocalStorageItem,
  setLocalStorageItem
} from '~/lib/utils';

const schema = z.object({
  email: z.email('Please enter a valid email address').max(100, 'Email must be less than 100 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must be less than 128 characters'),
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
    if (typeof window !== 'undefined') {
      const lastAuthMethod = getLocalStorageItem('LAST_AUTH_METHOD');
      setLastAuthMethod(lastAuthMethod ?? null);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      
      // Strategy: Try sign-up first, then fall back to sign-in
      // Better Auth returns { data, error } objects, not thrown exceptions
      console.log('Attempting sign up first...');
      const signUpResult = await authClient.signUp.email({
        email,
        password,
        name: name || email.split('@')[0], // Use email prefix as fallback name
      });
      
      // Check if sign-up was successful
      if (signUpResult.data && !signUpResult.error) {
        console.log('✅ Sign up successful:', signUpResult);
        return { result: signUpResult, isNewUser: true };
      }
      
      // Sign-up failed, try sign-in (user might already exist)
      console.log('Sign up failed, trying sign in...', signUpResult.error);
      
      const signInResult = await authClient.signIn.email({
        email,
        password,
      });
      
      // Check if sign-in was successful
      if (signInResult.data && !signInResult.error) {
        console.log('✅ Sign in successful:', signInResult);
        return { result: signInResult, isNewUser: false };
      }
      
      // Both failed - throw the sign-in error
      console.error('Both sign up and sign in failed:', signInResult.error);
      throw new Error(signInResult.error?.message || 'Authentication failed');
    },
    onError(error) {
      console.error('🚨 Final login mutation error:', error);
      toast.error(getErrorMessage(error));
    },
    onSuccess(data) {

      // Persist last used auth method
      if (typeof window !== 'undefined') {
        setLocalStorageItem('LAST_AUTH_METHOD', 'email');
      }
      
      // Show success message
      if (data?.isNewUser) {
        toast.success('Account created and signed in successfully!');
      } else {
        toast.success('Successfully signed in!');
      }
      
      // Call onSuccess callback if provided
      onSuccess?.();
      
      // Invalidate session queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ['session'] });
      
      router.push('/');
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
      toast.error(firstError?.message || 'Please check your input');
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
          name="email"
          placeholder={session?.user?.email || 'name@example.com'}
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="bg-background"
          required
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          className="bg-background"
          required
        />
      </div>
      <Button
        disabled={loginMutation.isPending}
        type="submit"
        className="relative"
      >
        {loginMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          'Continue with Email'
        )}
        {lastAuthMethod === 'email' && (
          <i className="text-xs absolute -right-0.5 -top-2 px-1 py-0.5 rounded text-center bg-blue-500 text-blue-50">
            Last used
          </i>
        )}
      </Button>
    </form>
  );
}