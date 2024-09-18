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
import { differenceInSeconds, addSeconds, format, addMinutes } from 'date-fns'
import { useRouter } from 'next/router'

type UpcomingSession = Tables<'session'> & { isUserRegistered: boolean }

interface AppContextType {
  communities: Tables<'community'>[]
  upcomingSession: UpcomingSession | null
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
  const router = useRouter()
  const { session, user } = useAuth()
  const [communities, setCommunities] = useState<Tables<'community'>[] | null>(null)
  const [upcomingSession, setUpcomingSession] = useState<UpcomingSession | null>(null)
  const [countdown, setCountdown] = useState<{ timeLeft: string; isLessThanOneMinute: boolean }>({
    timeLeft: '',
    isLessThanOneMinute: false,
  })

  const fetchUpcomingSession = useCallback(
    async (communityId: string) => {
      if (!user) {
        setUpcomingSession(null)
        return
      }

      try {
        const now = new Date()
        const fiveMinutesAgo = addMinutes(now, -5)

        const { data, error } = await supabase
          .from('session')
          .select(
            `
            *,
            user_to_session (user_id)
          `,
          )
          .eq('community_id', communityId)
          .gte('scheduled_at', fiveMinutesAgo.toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) {
          throw error
        } else if (data) {
          const isUserRegistered = data.user_to_session.some(
            (registration) => registration.user_id === user.id,
          )
          setUpcomingSession({ ...data, isUserRegistered })
        } else {
          setUpcomingSession(null)
        }
      } catch (error) {
        console.error('Error fetching upcoming or ongoing session:', error)
        setUpcomingSession(null)
      }
    },
    [user],
  )

  useEffect(() => {
    if (upcomingSession) {
      const timer = setInterval(() => {
        const now = new Date()
        const sessionStart = new Date(upcomingSession.scheduled_at)
        const sessionEnd = addMinutes(sessionStart, 5)
        const secondsToStart = differenceInSeconds(sessionStart, now)
        const secondsToEnd = differenceInSeconds(sessionEnd, now)

        if (secondsToStart > 0) {
          const timeLeft = format(addSeconds(new Date(0), secondsToStart), 'mm:ss')
          setCountdown({
            timeLeft,
            isLessThanOneMinute: secondsToStart < 60,
          })
        } else if (secondsToEnd > 0) {
          setCountdown({ timeLeft: 'Ongoing', isLessThanOneMinute: false })

          // Redirect to the session page if the user is registered
          if (upcomingSession.isUserRegistered) {
            setTimeout(() => {
              router.push(`community/${upcomingSession.community_id}/session/${upcomingSession.id}`)
            }, 3000) // 1 second delay
          }
        } else {
          setCountdown({ timeLeft: 'Ended', isLessThanOneMinute: false })
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [upcomingSession, router])

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
