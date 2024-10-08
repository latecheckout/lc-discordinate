import { SessionWithConfig } from '@/contexts/app.context'
import { Tables } from '@/lib/database.types'
import { CalendarIcon, ClockIcon, Share2, Users } from 'lucide-react'
import { cn, getURL } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { toast } from 'sonner'

type SessionCardProps = {
  session: SessionWithConfig
  type: 'ongoing' | 'upcoming'
  countdown?: { timeLeft: string; isLessThanOneMinute: boolean }
  onRegister?: () => void
  onJoin?: () => void
  isLoadingRegister?: boolean
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  type,
  countdown,
  onRegister,
  onJoin,
  isLoadingRegister,
}) => {
  const handleCopyLink = async () => {
    const shareUrl = `${getURL()}community/${session.community_id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Session link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link. Please try again.')
    }
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl rounded-lg overflow-hidden border border-primary/20">
      <div className="bg-primary px-4 py-5 sm:px-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary-foreground flex items-center">
          <CalendarIcon className="mr-2 h-6 w-6" />
          {type === 'ongoing' ? 'Ongoing Session' : 'Upcoming Session'}
        </h2>
        {type === 'upcoming' && countdown?.timeLeft && (
          <span
            className={cn(
              'text-emerald-100 text-sm font-medium bg-emerald-600/80 px-3 py-1 rounded-full shadow-md w-28 text-center',
              countdown.isLessThanOneMinute && 'animate-pulse',
            )}
          >
            {countdown.timeLeft}
          </span>
        )}
        {type === 'ongoing' && (
          <span className="text-emerald-100 text-sm font-medium bg-emerald-600/80 px-3 py-1 rounded-full shadow-md w-28 text-center">
            Ongoing
          </span>
        )}
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center text-foreground mb-2">
          <ClockIcon className="mr-2 h-5 w-5 text-primary/70" />
          <p className="font-medium">{new Date(session.scheduled_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center text-foreground mb-4">
          <Badge className="text-sm flex items-center gap-1 px-3 py-1">
            <Users className="h-4 w-4" />
            {session.userToSession.length} participant{session.userToSession.length !== 1 && 's'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          {type === 'upcoming' && !session.isUserRegistered && onRegister && (
            <Button onClick={onRegister} disabled={isLoadingRegister}>
              {isLoadingRegister ? 'Registering...' : 'Register for Session'}
            </Button>
          )}
          {type === 'ongoing' && onJoin && <Button onClick={onJoin}>Join Session</Button>}
          <Button onClick={handleCopyLink} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Invite others to join!
          </Button>
        </div>
        {type === 'upcoming' && session.isUserRegistered && (
          <p className="mt-4 text-sm text-muted-foreground">You are registered for this session.</p>
        )}
      </div>
    </div>
  )
}

export const PastSessionItem: React.FC<{ session: SessionWithConfig }> = ({ session }) => {
  const scheduledDate = new Date(session.scheduled_at).toLocaleDateString()

  return (
    <div className="flex items-center justify-between py-4 border-b border-primary/10 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{scheduledDate}</span>
        </div>
        <Badge
          variant="secondary"
          className="flex items-center space-x-1 bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Users className="h-3 w-3" />
          <span>{session.userToSession.length}</span>
        </Badge>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Final Score:</span>
        <span className="text-lg font-bold text-primary">{session.final_score}</span>
      </div>
    </div>
  )
}
