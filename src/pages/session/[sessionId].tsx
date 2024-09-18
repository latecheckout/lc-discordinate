import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'
import { fetchSessionAndConfig } from '@/lib/supabase/communityOperations'
import { SessionButton } from '@/components/session/SessionButton'
import { formatSecondsToMMSS } from '@/lib/utils'

interface SessionConfig {
  countdown_seconds: number
  button_press_seconds: number
  button_press_timeout_seconds: number
}

type SessionPhase = 'countdown' | 'pre-button' | 'button-phase' | 'ended'

export default function SessionPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const [session, setSession] = useState<Tables<'session'> | null>(null)
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [SessionPhase, setSessionPhase] = useState<SessionPhase>('countdown')
  const [buttonPhaseProgress, setButtonPhaseProgress] = useState(0)

  useEffect(() => {
    const effect = async () => {
      if (!sessionId || typeof sessionId !== 'string') return
      const { session, config } = await fetchSessionAndConfig(sessionId)
      setSession(session)
      setSessionConfig(config)
    }

    effect()
  }, [sessionId])

  useEffect(() => {
    if (!session || !sessionConfig) return

    const timer = setInterval(() => {
      const now = Date.now() / 1000
      const sessionStart = new Date(session.scheduled_at).getTime() / 1000
      const buttonPhaseStart = sessionStart + sessionConfig.countdown_seconds
      const buttonPhaseEnd = buttonPhaseStart + sessionConfig.button_press_seconds

      if (now >= buttonPhaseEnd) {
        setSessionPhase('ended')
        setButtonPhaseProgress(0)
        clearInterval(timer)
      } else if (now >= buttonPhaseStart) {
        setSessionPhase('button-phase')
        setCountdown(buttonPhaseEnd - now)
        setButtonPhaseProgress(
          Math.floor(((buttonPhaseEnd - now) / sessionConfig.button_press_seconds) * 100),
        )
      } else if (now >= sessionStart) {
        setSessionPhase('pre-button')
        setCountdown(buttonPhaseStart - now)
        setButtonPhaseProgress(100)
      } else {
        setSessionPhase('countdown')
        setCountdown(sessionStart - now)
        setButtonPhaseProgress(100)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session, sessionConfig])

  const handleButtonClick = async () => {
    if (!session || !sessionConfig) return
    const { error } = await supabase.functions.invoke('button', {
      body: { session_id: session.id },
    })
    if (error) console.error('Error invoking button function:', error)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {SessionPhase === 'countdown' && (
        <div className="text-4xl font-bold mb-4 text-gray-800">
          Session starts in: {formatSecondsToMMSS(countdown)}
        </div>
      )}
      {SessionPhase === 'pre-button' && (
        <div className="text-4xl font-bold mb-4 text-gray-800">
          Button phase starts in: {formatSecondsToMMSS(countdown)}
        </div>
      )}
      {SessionPhase === 'button-phase' && (
        <div className="text-4xl font-bold mb-4 text-red-600">Press the button!</div>
      )}
      {SessionPhase === 'button-phase' && (
        <div className="w-72 h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${buttonPhaseProgress}%` }}
          ></div>
        </div>
      )}
      {SessionPhase === 'ended' && (
        <div className="text-2xl font-bold text-gray-800">Session has ended</div>
      )}
      {(SessionPhase === 'button-phase' || SessionPhase === 'pre-button') && (
        <SessionButton
          cooldown={sessionConfig?.button_press_timeout_seconds || 0}
          onClick={handleButtonClick}
          disabled={SessionPhase !== 'button-phase'}
        />
      )}
    </div>
  )
}
