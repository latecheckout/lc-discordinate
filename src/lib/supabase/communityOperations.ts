import { Tables } from '@/lib/database.types'
import { supabase } from './client'

export async function fetchCommunities(dToken: string, accessToken: string) {
  const { data, error } = await supabase.functions.invoke<Tables<'community'>[]>('discord', {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { discordProviderToken: dToken },
  })
  if (error) throw error
  return data ?? []
}

export async function upsertCommunities(communities: Tables<'community'>[], userId: string) {
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
