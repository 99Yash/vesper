'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { authClient } from '~/lib/auth-client';
import { OAUTH_PROVIDERS, type OAuthProvider } from '~/lib/constants';
import { getErrorMessage } from '~/lib/utils';

interface OAuthButtonProps {
  providerId: OAuthProvider;
  className?: React.ComponentProps<typeof Button>['className'];
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ providerId, className }) => {

	const  [isLoading, setIsLoading] = React.useState(false);
  const [lastAuthMethod, setLastAuthMethod] =
    React.useState<OAuthProvider>();

  return (
    <Button
      variant="outline"
      className={`w-full relative ${className}`}
      onClick={async () => {
				try {
					setIsLoading(true);
        await authClient.signIn.social({
          provider: providerId,
        });
				setLastAuthMethod(providerId);
				} catch (error) {
					toast.error(getErrorMessage(error));
				} finally {
					setIsLoading(false);
				}
      }}
    >

      <span className="text-sm">
        {isLoading
          ? 'Signing in…'
          : `Continue with ${OAUTH_PROVIDERS[providerId].name}`}
      </span>
      	{isLoading ? (
        <Loader2 className="mr-2 bg-background" />
      ) : (
        lastAuthMethod === (providerId.toUpperCase() as OAuthProvider) && (
          <i className="text-xs absolute right-4 text-muted-foreground text-center">
            Last used
           </i>
        )
      )}
    </Button>
  );
};

export const OAuthButtons: React.FC<{
  className?: React.ComponentProps<typeof Button>['className'];
}> = ({ className }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {Object.values(OAUTH_PROVIDERS).map((provider) => (
        <OAuthButton
          key={provider.id}
          providerId={provider.id}
        />
      ))}
    </div>
  );
};

export { OAuthButton };
