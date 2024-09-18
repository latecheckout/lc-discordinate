import { supabaseAdmin } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  // 1. Capture current time
  const currentTime = new Date().toISOString()
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validate user with Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders,
      })
    }
    const jwt = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not Authorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 3. Parse request body
    const { session_id } = await req.json()

    // Check if all required info is in the request body
    if (!session_id) {
      return new Response('Bad Request: Missing required information', {
        status: 400,
        headers: corsHeaders,
      })
    }

    // 4. Use admin client to add record to button press table
    const { data, error } = await supabaseAdmin.from('button_press').insert({
      user_id: user.id,
      session_id: session_id,
      created_at: currentTime,
    })

    if (error) throw error

    // 5. Return 201 if successful
    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // 6. Return 500 if not successful
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message ?? error }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
