"use client";

import BetterAuthActionButton from "./better-auth-action-button";
import { authClient } from "@/lib/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
} from "@/lib/o-auth-providers";

const SocialAuthButtons = () => {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].Icon;

    return (
      <BetterAuthActionButton
        key={provider}
        variant="outline"
        className="bg-card text-foreground"
        action={() => {
          return authClient.signIn.social({ provider, callbackURL: "/" });
        }}
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
      </BetterAuthActionButton>
    );
  });
};

export default SocialAuthButtons;
