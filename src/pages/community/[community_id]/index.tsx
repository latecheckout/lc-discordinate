import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { getCommunityWithUserCount } from '@/lib/supabase/communityOperations'
import { Tables } from '@/lib/database.types'
import { SessionWithConfig, useApp } from '@/contexts/app.context'
import { CalendarIcon, ClockIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreateSessionButton } from '@/components/CreateSessionButton'

export default function CommunityPage() {
  const router = useRouter()
  const { community_id } = router.query
  const {
    upcomingSession,
    ongoingSession,
    countdown,
    pastSessions,
    startPolling,
    stopPolling,
    fetchUpcomingAndOngoingSession,
    fetchPastSessions,
  } = useApp()

  const [community, setCommunity] = useState<(Tables<'community'> & { userCount: number }) | null>(
    null,
  )
  const [isLoadingRegister, setIsLoadingRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchInitialData = async () => {
      if (community_id) {
        setIsLoading(true)
        try {
          await Promise.all([
            fetchUpcomingAndOngoingSession(community_id as string),
            fetchPastSessions(community_id as string),
          ])
          startPolling(community_id as string)
        } catch (error) {
          console.error('Error fetching initial session data:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchInitialData()

    return () => stopPolling()
  }, [community_id, fetchUpcomingAndOngoingSession, fetchPastSessions, startPolling, stopPolling])

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (!community_id) return
      try {
        const { community, userCount } = await getCommunityWithUserCount(community_id as string)
        if (community) {
          setCommunity({ ...community, userCount })
        } else {
          console.error('Community not found')
        }
      } catch (error) {
        console.error('Failed to get community details', error)
      }
    }

    fetchCommunityDetails()
  }, [community_id])

  const handleRegister = async () => {
    if (!user || !upcomingSession || !community) return

    try {
      setIsLoadingRegister(true)
      const { error } = await supabase
        .from('user_to_session')
        .insert({ user_id: user.id, session_id: upcomingSession.id, community_id: community.id })

      if (error) throw error

      await fetchUpcomingAndOngoingSession(community.id)
      toast.success('You have been registered for the session.')
    } catch (error) {
      console.error('Error registering for session:', error)
      toast.error('Failed to register for the session.')
    } finally {
      setIsLoadingRegister(false)
    }
  }

  if (isLoading || !community) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-muted-foreground">Loading community details...</p>
        </div>
      </Layout>
    )
  }

  // Filter out the ongoing session from past sessions
  const filteredPastSessions = pastSessions.filter((session) => session.id !== ongoingSession?.id)

  return (
    <Layout>
      <div className="bg-card shadow-xl rounded-lg overflow-hidden">
        <div className="bg-primary px-4 py-5 sm:px-6 flex items-center">
          {community.pfp ? (
            <Image
              src={`https://cdn.discordapp.com/icons/${community.guild_id}/${community.pfp}.png`}
              alt={`${community.name} icon`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full mr-4 border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full mr-4 bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {community.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-primary-foreground">{community.name}</h1>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Community Information</h2>
          <p className="text-muted-foreground">
            Number of joined users: {community.userCount ?? 'Loading...'}
          </p>
        </div>
      </div>

      {ongoingSession && (
        <SessionCard
          session={ongoingSession}
          type="ongoing"
          community={community}
          onJoin={() => router.push(`/community/${community.id}/session/${ongoingSession.id}`)}
        />
      )}

      {upcomingSession && (
        <SessionCard
          session={upcomingSession}
          type="upcoming"
          community={community}
          countdown={countdown}
          onRegister={handleRegister}
          isLoadingRegister={isLoadingRegister}
        />
      )}

      {!upcomingSession && !ongoingSession && community && (
        <CreateSessionButton communityId={community.id} />
      )}

      {filteredPastSessions.length > 0 && (
        <div className="mt-6 bg-card shadow-xl rounded-lg overflow-hidden">
          <div className="bg-primary px-4 py-5 sm:px-6">
            <h2 className="text-xl font-semibold text-primary-foreground">Past Sessions</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {filteredPastSessions.map((session) => (
              <PastSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

type SessionCardProps = {
  session: SessionWithConfig
  type: 'ongoing' | 'upcoming'
  community: Tables<'community'>
  countdown?: { timeLeft: string; isLessThanOneMinute: boolean }
  onRegister?: () => void
  onJoin?: () => void
  isLoadingRegister?: boolean
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  type,
  community,
  countdown,
  onRegister,
  onJoin,
  isLoadingRegister,
}) => {
  return (
    <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl rounded-lg overflow-hidden border border-primary/20">
      <div className="bg-primary px-4 py-5 sm:px-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary-foreground flex items-center">
          <CalendarIcon className="mr-2 h-6 w-6" />
          {type === 'ongoing' ? 'Ongoing Session' : 'Upcoming Session'}
        </h2>
        {type === 'upcoming' && countdown?.timeLeft && (
          <span
            className={cn(
              'text-emerald-100 text-sm font-medium bg-emerald-600/80 px-3 py-1 rounded-full shadow-md w-28 text-center',
              countdown.isLessThanOneMinute && 'animate-pulse',
            )}
          >
            {countdown.timeLeft}
          </span>
        )}
        {type === 'ongoing' && (
          <span className="text-emerald-100 text-sm font-medium bg-emerald-600/80 px-3 py-1 rounded-full shadow-md w-28 text-center">
            Ongoing
          </span>
        )}
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center text-foreground mb-2">
          <ClockIcon className="mr-2 h-5 w-5 text-primary/70" />
          <p className="font-medium">{new Date(session.scheduled_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center text-foreground mb-4">
          <Badge className="text-sm flex items-center gap-1 px-3 py-1">
            <Users className="h-4 w-4" />
            {session.userToSession.length} participant{session.userToSession.length !== 1 && 's'}
          </Badge>
        </div>
        {type === 'upcoming' && !session.isUserRegistered && onRegister && (
          <Button onClick={onRegister} className="mt-4">
            {isLoadingRegister ? 'Registering...' : 'Register for Session'}
          </Button>
        )}
        {type === 'upcoming' && session.isUserRegistered && (
          <p className="mt-4 text-sm text-muted-foreground">You are registered for this session.</p>
        )}
        {type === 'ongoing' && onJoin && (
          <Button onClick={onJoin} className="mt-4">
            Join Session
          </Button>
        )}
      </div>
    </div>
  )
}

const PastSessionCard: React.FC<{ session: SessionWithConfig }> = ({ session }) => {
  const startTime = new Date(session.scheduled_at)
  const endTime = session.config
    ? new Date(
        startTime.getTime() +
          (session.config.countdown_seconds + session.config.button_press_seconds) * 1000,
      )
    : startTime

  return (
    <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl rounded-lg overflow-hidden border border-primary/20">
      <div className="bg-primary px-4 py-5 sm:px-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary-foreground">Session #{session.id}</h3>
        <Badge variant="secondary" className="text-sm">
          <Users className="h-4 w-4 mr-2" /> {session.userToSession.length}
        </Badge>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Started</p>
            <p className="font-medium">{startTime.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ended</p>
            <p className="font-medium">{endTime.toLocaleString()}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Final Score</p>
            <p className="text-2xl font-bold text-primary">{session.final_score}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
