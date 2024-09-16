import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client' // Ensure you have this file to initialize Supabase client

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextType {
  user: User | null
  session: Session | null
  status: AuthStatus
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      // this is when the user is logged in but not authorized on discord side
      if (!data.session?.provider_token) {
        setSession(null)
        const { error } = await supabase.auth.signOut()
      }
    }
    checkSession()
  }, [])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    status,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
