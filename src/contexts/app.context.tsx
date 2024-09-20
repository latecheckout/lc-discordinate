import { Tables } from '@/lib/database.types'
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useAuth } from './auth.context'
import { fetchCommunities } from '@/lib/supabase/communityOperations'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/router'

export type SessionWithConfig = Tables<'session'> & {
  config: Tables<'session_config'>
  userToSession: { user_id: string }[]
} & {
  isUserRegistered: boolean
}

interface AppContextType {
  communities: Tables<'community'>[]
  upcomingSession: SessionWithConfig | null
  ongoingSession: SessionWithConfig | null
  countdown: {
    timeLeft: string
    isLessThanOneMinute: boolean
  }
  fetchUpcomingAndOngoingSession: (communityId: string) => Promise<void>
  pastSessions: SessionWithConfig[]
  fetchPastSessions: (communityId: string) => Promise<void>
  startPolling: (communityId: string) => void
  stopPolling: () => void
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Create a provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const { session, user } = useAuth()
  const [communities, setCommunities] = useState<Tables<'community'>[] | null>(null)
  const [upcomingSession, setUpcomingSession] = useState<SessionWithConfig | null>(null)
  const [ongoingSession, setOngoingSession] = useState<SessionWithConfig | null>(null)
  const [countdown, setCountdown] = useState<{ timeLeft: string; isLessThanOneMinute: boolean }>({
    timeLeft: '',
    isLessThanOneMinute: false,
  })
  const [pastSessions, setPastSessions] = useState<SessionWithConfig[]>([])

  const [currentCommunityId, setCurrentCommunityId] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchUpcomingAndOngoingSession = useCallback(
    async (communityId: string) => {
      if (!user) {
        setUpcomingSession(null)
        setOngoingSession(null)
        return
      }

      try {
        const now = new Date()
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

        const { data, error } = await supabase
          .from('session')
          .select(
            `
            *,
            userToSession:user_to_session (user_id),
            config:session_config (*)
          `,
          )
          .eq('community_id', communityId)
          .gte('scheduled_at', fiveMinutesAgo.toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(2)

        if (error) {
          throw error
        } else if (data && data.length > 0) {
          const sessions = data.map((session) => ({
            ...session,
            isUserRegistered: session.userToSession.some(
              (registration) => registration.user_id === user.id,
            ),
          }))

          const currentTime = now.getTime()
          const ongoingSessionIndex = sessions.findIndex((session) => {
            if (!session.config) return false
            const startTime = new Date(session.scheduled_at).getTime()
            const endTime =
              startTime +
              (session.config.countdown_seconds + session.config.button_press_seconds) * 1000
            return currentTime >= startTime && currentTime < endTime
          })
          if (ongoingSessionIndex !== -1) {
            setOngoingSession(sessions[ongoingSessionIndex] as SessionWithConfig)
            setUpcomingSession(
              (sessions[ongoingSessionIndex + 1] as SessionWithConfig | undefined) || null,
            )
          } else {
            setOngoingSession(null)
            // Check if the session has ended before setting it as upcoming
            const now = new Date().getTime()
            const firstSession = sessions[0] as SessionWithConfig
            if (firstSession && firstSession.config) {
              const sessionEndTime =
                new Date(firstSession.scheduled_at).getTime() +
                (firstSession.config.countdown_seconds + firstSession.config.button_press_seconds) *
                  1000
              if (now < sessionEndTime) {
                setUpcomingSession(firstSession)
              } else {
                setUpcomingSession(null)
              }
            } else {
              setUpcomingSession(null)
            }
          }
        } else {
          setUpcomingSession(null)
          setOngoingSession(null)
        }
      } catch (error) {
        console.error('Error fetching upcoming or ongoing session:', error)
        setUpcomingSession(null)
        setOngoingSession(null)
      }
    },
    [user],
  )

  const fetchPastSessions = useCallback(
    async (communityId: string) => {
      if (!user) {
        setPastSessions([])
        return
      }

      try {
        const now = new Date()

        const { data, error } = await supabase
          .from('session')
          .select(
            `
            *,
            config:session_config (*),
            userToSession:user_to_session (user_id)
          `,
          )
          .eq('community_id', communityId)
          .lt('scheduled_at', now.toISOString())
          .order('scheduled_at', { ascending: false })

        if (error) {
          throw error
        } else if (data) {
          setPastSessions(data as SessionWithConfig[])
        } else {
          setPastSessions([])
        }
      } catch (error) {
        console.error('Error fetching past sessions:', error)
        setPastSessions([])
      }
    },
    [user],
  )

  const startPolling = useCallback(
    (communityId: string) => {
      setCurrentCommunityId(communityId)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      pollingIntervalRef.current = setInterval(() => {
        fetchUpcomingAndOngoingSession(communityId)
        fetchPastSessions(communityId)
      }, 10000) // 10 seconds
    },
    [fetchUpcomingAndOngoingSession, fetchPastSessions],
  )

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setCurrentCommunityId(null)
  }, [])

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (upcomingSession) {
      const timer = setInterval(() => {
        const now = Date.now() / 1000
        const sessionStart = new Date(upcomingSession.scheduled_at).getTime() / 1000
        const buttonPhaseStart = sessionStart + upcomingSession.config.countdown_seconds
        const buttonPhaseEnd = buttonPhaseStart + upcomingSession.config.button_press_seconds

        if (now >= buttonPhaseEnd) {
          setCountdown({ timeLeft: 'Ended', isLessThanOneMinute: false })
          setUpcomingSession(null)
          clearInterval(timer)
        } else if (now >= sessionStart) {
          setCountdown({ timeLeft: 'Ongoing', isLessThanOneMinute: false })

          // Redirect to the session page if the user is registered
          if (upcomingSession.isUserRegistered) {
            setTimeout(() => {
              router.push(
                `/community/${upcomingSession.community_id}/session/${upcomingSession.id}`,
              )
            }, 3000)
          }
        } else {
          const timeLeftSeconds = Math.floor(sessionStart - now)
          const minutes = Math.floor(timeLeftSeconds / 60)
          const seconds = timeLeftSeconds % 60
          const timeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          setCountdown({
            timeLeft,
            isLessThanOneMinute: timeLeftSeconds < 60,
          })
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
    ongoingSession,
    countdown,
    fetchUpcomingAndOngoingSession,
    pastSessions,
    fetchPastSessions,
    startPolling,
    stopPolling,
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
