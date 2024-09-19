import { Tables } from '@/lib/database.types'
import { supabase } from './client'

export async function fetchCommunities(
  dToken: string,
  accessToken: string,
): Promise<Tables<'community'>[]> {
  const { error } = await supabase.functions.invoke<Tables<'community'>[]>('discord', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { discordProviderToken: dToken },
  })
  if (error) throw error
  const { data } = await supabase.from('community').select('*')
  return data ?? []
}

export async function upsertCommunities(
  communities: Tables<'community'>[],
  userId: string,
): Promise<Map<string, string>> {
  const { data: communityData, error: upsertError } = await supabase
    .from('community')
    .upsert(
      communities.map((community) => ({ ...community, created_by: userId })),
      { onConflict: 'guild_id' },
    )
    .select('id, guild_id')

  if (upsertError) {
    throw new Error(`Failed to upsert communities: ${upsertError.message}`)
  }

  return new Map(communityData.map((c) => [c.guild_id, c.id]))
}

export async function upsertUserCommunityRelationships(
  communities: Tables<'community'>[],
  communityIdMap: Map<string, string>,
  userId: string,
) {
  const { error: userCommunityError } = await supabase.from('user_to_community').upsert(
    communities.map((community) => ({
      user_id: userId,
      community_id: communityIdMap.get(community.guild_id) ?? '',
    })),
    { onConflict: 'user_id,community_id' },
  )

  if (userCommunityError) {
    throw new Error(`Failed to upsert user_to_community: ${userCommunityError.message}`)
  }
}

export async function getCommunityWithUserCount(
  communityId: string,
): Promise<{ community: Tables<'community'> | null; userCount: number }> {
  const { data, error: communityError } = await supabase
    .from('community')
    .select(
      `
      *,
      user_count:user_to_community(count)
    `,
    )
    .eq('id', communityId)
    .single()

  if (communityError) {
    throw new Error(`Failed to get community with user count: ${communityError.message}`)
  }

  return {
    community: data,
    userCount: data?.user_count?.[0]?.count ?? 0,
  }
}

export async function fetchSessionAndConfig(
  sessionId: string,
): Promise<{ session: Tables<'session'> | null; config: Tables<'session_config'> | null }> {
  const { data: sessionData, error: sessionError } = await supabase
    .from('session')
    .select('*, config:session_config(*)')
    .eq('id', sessionId)
    .single()

  if (sessionError) {
    throw new Error(`Failed to fetch session: ${sessionError.message}`)
  }
  return {
    session: sessionData,
    config: sessionData?.config ?? null,
  }
}
