import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { getCommunityWithUserCount } from '@/lib/supabase/communityOperations'
import { Tables } from '@/lib/database.types'
import { CreateSessionDialog } from '@/components/CreateSessionDialog'
import { supabase } from '@/lib/supabase/client'

export default function CommunityPage() {
  const router = useRouter()
  const { id } = router.query
  const [userCount, setUserCount] = useState<number | null>(null)
  const [community, setCommunity] = useState<Tables<'community'> | null>(null)
  const [existingSession, setExistingSession] = useState<boolean>(false)

  const checkExistingSession = useCallback(async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('session')
        .select('id')
        .eq('community_id', communityId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)

      if (error) throw error
      setExistingSession(data.length > 0)
    } catch (error) {
      console.error('Error checking existing session:', error)
    }
  }, [])

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const { community, userCount } = await getCommunityWithUserCount(id as string)
        setCommunity(community)
        setUserCount(userCount)

        if (community) {
          await checkExistingSession(community.id)
        }
      } catch (error) {
        console.error('Failed to get community details', error)
      }
    }

    if (id) {
      fetchCommunityDetails()
    }
  }, [id, checkExistingSession])

  const handleSessionCreated = useCallback(() => {
    if (community) {
      checkExistingSession(community.id)
    }
  }, [community, checkExistingSession])

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

      {!existingSession && community && (
        <CreateSessionDialog communityId={community.id} onSessionCreated={handleSessionCreated} />
      )}
    </Layout>
  )
}
