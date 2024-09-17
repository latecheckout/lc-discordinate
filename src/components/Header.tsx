import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Header() {
  const { user } = useAuth()

  const logout = () => {
    supabase.auth.signOut()
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            Discordinate
          </Link>
          {user && (
            <button
              onClick={logout}
              className="bg-primary-foreground text-primary px-4 py-2 rounded-md hover:bg-primary-foreground/90 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
