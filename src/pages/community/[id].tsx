import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { getCommunityWithUserCount } from '@/lib/supabase/communityOperations'
import { Tables } from '@/lib/database.types'
import { CreateSessionDialog } from '@/components/CreateSessionDialog'
import { useApp } from '@/contexts/app.context'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function CommunityPage() {
  const router = useRouter()
  const { id } = router.query
  const [userCount, setUserCount] = useState<number | null>(null)
  const [community, setCommunity] = useState<Tables<'community'> | null>(null)
  const [isLoadingRegister, setIsLoadingRegister] = useState(false)
  const { upcomingSession, countdown, fetchUpcomingSession } = useApp()
  const { user } = useAuth()

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const { community, userCount } = await getCommunityWithUserCount(id as string)
        setCommunity(community)
        setUserCount(userCount)

        if (community) {
          await fetchUpcomingSession(community.id)
        }
      } catch (error) {
        console.error('Failed to get community details', error)
      }
    }

    if (id) {
      fetchCommunityDetails()
    }
  }, [id, fetchUpcomingSession])

  const handleRegister = async () => {
    if (!user || !upcomingSession || !community) return

    try {
      setIsLoadingRegister(true)
      const { error } = await supabase
        .from('user_to_session')
        .insert({ user_id: user.id, session_id: upcomingSession.id, community_id: community.id })

      if (error) throw error

      // Refetch the session to update the registration status
      if (community) {
        await fetchUpcomingSession(community.id)
      }
    } catch (error) {
      console.error('Error registering for session:', error)
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoadingRegister(false)
    }
  }

  if (!community) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-muted-foreground">Loading community details...</p>
        </div>
      </Layout>
    )
  }

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
            Number of joined users: {userCount !== null ? userCount : 'Loading...'}
          </p>
          {/* Add more community information here as needed */}
        </div>
      </div>

      {upcomingSession && (
        <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl rounded-lg overflow-hidden border border-primary/20">
          <div className="bg-primary px-4 py-5 sm:px-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-foreground flex items-center">
              <CalendarIcon className="mr-2 h-6 w-6" />
              Upcoming Session
            </h2>
            {countdown.timeLeft ? (
              <span
                className={cn(
                  'text-emerald-100 text-sm font-medium bg-emerald-600/80 px-3 py-1 rounded-full shadow-md w-28 text-center',
                  countdown.isLessThanOneMinute && 'animate-pulse',
                )}
              >
                {countdown.timeLeft}
              </span>
            ) : (
              <span className="text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center shadow-md w-28 justify-center">
                <span className="mr-2">Loading</span>
                <span className="flex space-x-1">
                  <span
                    className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                </span>
              </span>
            )}
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center text-foreground mb-2">
              <ClockIcon className="mr-2 h-5 w-5 text-primary/70" />
              <p className="font-medium">
                {new Date(upcomingSession.scheduled_at).toLocaleString()}
              </p>
            </div>
            {!upcomingSession.isUserRegistered && (
              <Button onClick={handleRegister} className="mt-4">
                {isLoadingRegister ? 'Registering...' : 'Register for Session'}
              </Button>
            )}
            {upcomingSession.isUserRegistered && (
              <p className="mt-4 text-sm text-muted-foreground">
                You are registered for this session.
              </p>
            )}
            {/* Add more session details here if needed */}
          </div>
        </div>
      )}

      {!upcomingSession && community && <CreateSessionDialog communityId={community.id} />}
    </Layout>
  )
}
