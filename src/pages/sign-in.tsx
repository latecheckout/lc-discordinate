import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { getURL } from '@/lib/utils'

export default function SignIn() {
  const { status } = useAuth()
  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${getURL()}/dashboard`, // Redirect to dashboard after successful sign-in
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Discord:', error)
      alert('Failed to sign in with Discord. Please try again.')
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <h1 className="mb-8 text-center text-4xl font-bold">Sign in</h1>
      <Button
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
        onClick={handleSignIn}
        disabled={status === 'loading'}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 71 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG path remains the same */}
        </svg>
        {status === 'loading' ? 'Signing in...' : 'Sign in with Discord'}
      </Button>
    </main>
  )
}
