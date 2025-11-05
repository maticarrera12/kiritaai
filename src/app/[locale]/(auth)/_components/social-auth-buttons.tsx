"use client";

import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
} from "@/lib/o-auth-providers";
import { authClient } from "@/lib/auth-client";
import BetterAuthActionButton from "./better-auth-action-button";


const SocialAuthButtons = () => {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].Icon;

    return (
      <BetterAuthActionButton
        key={provider}
        variant="outline"
        className="!bg-indigo-100 dark:!bg-indigo-950 !text-indigo-900 dark:!text-indigo-50 !border-indigo-200 dark:!border-indigo-800 hover:!bg-indigo-50 dark:hover:!bg-indigo-900 hover:!text-indigo-900 dark:hover:!text-indigo-50"
        action={() => {return authClient.signIn.social({ provider, callbackURL: "/" })}}
      >
        <Icon />
        Continue with {SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
      </BetterAuthActionButton>
    );
  });
};

export default SocialAuthButtons;
