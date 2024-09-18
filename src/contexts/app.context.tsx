import { Tables } from '@/lib/database.types'
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { useAuth } from './auth.context'
import { fetchCommunities } from '@/lib/supabase/communityOperations'
import { supabase } from '@/lib/supabase/client'
import { differenceInSeconds, addSeconds, format } from 'date-fns'

// Define the shape of your context
interface AppContextType {
  communities: Tables<'community'>[]
  upcomingSession: Tables<'session'> | null
  countdown: {
    timeLeft: string
    isLessThanOneMinute: boolean
  }
  fetchUpcomingSession: (communityId: string) => Promise<void>
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Create a provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, user } = useAuth()
  const [communities, setCommunities] = useState<Tables<'community'>[] | null>(null)
  const [upcomingSession, setUpcomingSession] = useState<Tables<'session'> | null>(null)
  const [countdown, setCountdown] = useState<{ timeLeft: string; isLessThanOneMinute: boolean }>({
    timeLeft: '',
    isLessThanOneMinute: false,
  })

  const fetchUpcomingSession = useCallback(async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('session')
        .select(`*`)
        .eq('community_id', communityId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No upcoming session found
          setUpcomingSession(null)
        } else {
          throw error
        }
      } else {
        setUpcomingSession(data)
      }
    } catch (error) {
      console.error('Error fetching upcoming session:', error)
      setUpcomingSession(null)
    }
  }, [])

  useEffect(() => {
    if (upcomingSession) {
      const timer = setInterval(() => {
        const now = new Date()
        const sessionStart = new Date(upcomingSession.scheduled_at)
        const secondsLeft = differenceInSeconds(sessionStart, now)

        if (secondsLeft <= 0) {
          setCountdown({ timeLeft: 'Started!', isLessThanOneMinute: false })
          clearInterval(timer)
        } else {
          const timeLeft = format(addSeconds(new Date(0), secondsLeft), 'mm:ss')
          setCountdown({
            timeLeft,
            isLessThanOneMinute: secondsLeft < 60,
          })
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [upcomingSession])

  useEffect(() => {
    const getCommunities = async (dToken: string) => {
      try {
        if (!session?.access_token) {
          throw new Error('No access token available')
        }
        const communities = await fetchCommunities(dToken, session.access_token)

        if (!user?.id) {
          throw new Error('No user ID available')
        }

        setCommunities(communities)
      } catch (error) {
        console.error('Failed to process communities:', error)
        // Handle the error appropriately
      }
    }

    if (session?.provider_token && communities === null) {
      getCommunities(session.provider_token)
    }
  }, [user, session, communities])

  const value = {
    communities: communities ?? [],
    upcomingSession,
    countdown,
    fetchUpcomingSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Create a custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
