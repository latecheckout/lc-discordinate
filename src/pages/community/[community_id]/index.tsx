import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { getCommunityWithUserCount } from '@/lib/supabase/communityOperations'
import { Tables } from '@/lib/database.types'
import { useApp } from '@/contexts/app.context'
import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CreateSessionButton } from '@/components/CreateSessionButton'
import { PastSessionCard, SessionCard } from '@/components/session/SessionCard'

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
          onJoin={() => router.push(`/community/${community.id}/session/${ongoingSession.id}`)}
        />
      )}

      {upcomingSession && (
        <SessionCard
          session={upcomingSession}
          type="upcoming"
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
