import { SessionWithConfig } from '@/contexts/app.context'
import { Tables } from '@/lib/database.types'
import { CalendarIcon, ClockIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
        {type === 'upcoming' && !session.isUserRegistered && onRegister && (
          <Button onClick={onRegister} className="mt-4">
            {isLoadingRegister ? 'Registering...' : 'Register for Session'}
          </Button>
        )}
        {type === 'upcoming' && session.isUserRegistered && (
          <p className="mt-4 text-sm text-muted-foreground">You are registered for this session.</p>
        )}
        {type === 'ongoing' && onJoin && (
          <Button onClick={onJoin} className="mt-4">
            Join Session
          </Button>
        )}
      </div>
    </div>
  )
}

export const PastSessionCard: React.FC<{ session: SessionWithConfig }> = ({ session }) => {
  const startTime = new Date(session.scheduled_at)
  const endTime = session.config
    ? new Date(
        startTime.getTime() +
          (session.config.countdown_seconds + session.config.button_press_seconds) * 1000,
      )
    : startTime

  return (
    <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl rounded-lg overflow-hidden border border-primary/20">
      <div className="bg-primary px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-semibold text-primary-foreground">Session</h3>
            <Badge variant="outline" className="bg-primary/20 text-primary-foreground">
              #{session.id.slice(-4)}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center space-x-2 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Users className="h-4 w-4" />
            <span className="hover:text-primary-foreground/90">{session.userToSession.length}</span>
          </Badge>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Started</p>
            <p className="font-medium">{startTime.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ended</p>
            <p className="font-medium">{endTime.toLocaleString()}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Final Score</p>
            <p className="text-2xl font-bold text-primary">{session.final_score}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
