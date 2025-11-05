import { createAuthClient } from "better-auth/react";

/**
 * Auth Client for client-side operations
 * 
 * Use it for:
 * - Checking the current session in components
 * - Getting the current user
 * - Verifying authentication in client components
 * 
 * DO NOT use authClient.signIn/signUp directly in the Next.js App Router.
 * Instead, use the Server Actions from lib/actions/auth-actions.ts
 */

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
})

export const { useSession } = authClient
