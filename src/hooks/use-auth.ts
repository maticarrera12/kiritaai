'use client'

import { useSession } from '@/lib/auth-client'

/**
 * Hook personalizado para manejar autenticación
 * 
 * Ejemplo de uso:
 * 
 * const { user, isLoading, isAuthenticated } = useAuth()
 * 
 * if (isLoading) return <Spinner />
 * if (!isAuthenticated) return <LoginPrompt />
 * 
 * return <Dashboard user={user} />
 */
export function useAuth() {
  const { data: session, isPending, error } = useSession()

  return {
    user: session?.user ?? null,
    session: session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error: error,
  }
}

