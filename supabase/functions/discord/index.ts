import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { API } from 'npm:@discordjs/core'
import { REST } from 'npm:@discordjs/rest'
import { supabase, supabaseAdmin } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authToken = req.headers.get('Authorization')
    const { discordProviderToken } = (await req.json()) as {
      discordProviderToken?: string
    }
    if (!authToken || !discordProviderToken) {
      console.error('Missing Auth Token(s)', {
        authToken: !!authToken,
        discordProviderToken: !!discordProviderToken,
      })
      return new Response(JSON.stringify({ error: 'Not Authorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const jwt = authToken.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(jwt)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not Authorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const rest = new REST({ authPrefix: 'Bearer' }).setToken(discordProviderToken)
    // Pass into API
    const api = new API(rest)

    // Fetch a guild using the API wrapper
    const guildsResp = await api.users.getGuilds()

    const guilds = guildsResp.map((guild) => ({
      guild_id: guild.id,
      name: guild.name,
      pfp: guild.icon,
    }))

    const { data: communities, error } = await supabaseAdmin
      .from('community')
      .upsert(guilds, {
        onConflict: 'guild_id',
      })
      .select('id')

    if (error) {
      console.error(error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!communities) {
      return new Response(JSON.stringify({ error: 'No communities found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const userToCommunities = communities.map((c) => ({
      user_id: user.id,
      community_id: c.id,
    }))

    const { error: userToCommunityError } = await supabaseAdmin
      .from('user_to_community')
      .upsert(userToCommunities, {
        onConflict: 'user_id,community_id',
      })

    if (userToCommunityError) {
      console.error(userToCommunityError)
      return new Response(JSON.stringify({ error: userToCommunityError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ error: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
