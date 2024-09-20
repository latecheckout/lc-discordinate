import React from 'react'
import { useAuth } from '@/contexts/auth.context'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/router'

interface HeaderProps {
  className?: string
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const router = useRouter()

  const signOut = () => {
    supabase.auth.signOut()
  }

  return (
    <header className={`bg-primary text-primary-foreground p-4 ${className}`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Discordinate
        </h1>

        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[200px] truncate">{user.email}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="flex flex-col space-y-2">
                <Button variant="outline" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  )
}

export default Header
