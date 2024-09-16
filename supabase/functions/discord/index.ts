// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { API } from 'npm:@discordjs/core'
import { REST } from 'npm:@discordjs/rest'
import { supabase } from '../_shared/supabase.ts'
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
      created_by: user.id,
    }))

    return new Response(JSON.stringify(guilds), {
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/placeholder' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
