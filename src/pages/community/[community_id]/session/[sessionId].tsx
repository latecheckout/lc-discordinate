import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'
import { fetchSessionAndConfig } from '@/lib/supabase/communityOperations'
import { SessionButton } from '@/components/session/SessionButton'
import { SessionCountDown } from '@/components/session/SessionCountDown'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClockIcon, CheckCircleIcon } from 'lucide-react'
import { useApp } from '@/contexts/app.context'

interface SessionConfig {
  countdown_seconds: number
  button_press_seconds: number
  button_press_timeout_seconds: number
}

type SessionPhase = 'countdown' | 'pre-button' | 'button-phase' | 'ended'

export default function SessionPage() {
  const router = useRouter()
  const { fetchUpcomingSession } = useApp()
  const { sessionId } = router.query
  const [session, setSession] = useState<Tables<'session'> | null>(null)
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [SessionPhase, setSessionPhase] = useState<SessionPhase>('countdown')
  const [buttonPhaseProgress, setButtonPhaseProgress] = useState(0)

  const fetchSessionData = useCallback(async () => {
    if (!sessionId || typeof sessionId !== 'string') return
    const { session, config } = await fetchSessionAndConfig(sessionId)
    setSession(session)
    setSessionConfig(config)
  }, [sessionId])

  useEffect(() => {
    fetchSessionData()
  }, [fetchSessionData])

  useEffect(() => {
    if (!session || !sessionConfig) return

    if (
      new Date(session.scheduled_at).getTime() + sessionConfig.countdown_seconds * 1000 >
      Date.now()
    ) {
    }

    const timer = setInterval(() => {
      const now = Date.now() / 1000
      const sessionStart = new Date(session.scheduled_at).getTime() / 1000
      const buttonPhaseStart = sessionStart + sessionConfig.countdown_seconds
      const buttonPhaseEnd = buttonPhaseStart + sessionConfig.button_press_seconds

      if (now >= buttonPhaseEnd) {
        setSessionPhase('ended')
        setButtonPhaseProgress(0)
        clearInterval(timer)

        // Refetch session data when the session ends
        fetchSessionData()
        fetchUpcomingSession(session.community_id)
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
        setCountdown(buttonPhaseStart - now)
        setButtonPhaseProgress(100)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session, sessionConfig, fetchSessionData, fetchUpcomingSession])

  const handleButtonClick = async () => {
    if (!session || !sessionConfig) return
    const { error } = await supabase.functions.invoke('button', {
      body: { session_id: session.id },
    })
    if (error) console.error('Error invoking button function:', error)
  }

  if (SessionPhase === 'countdown') {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Session Starting Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">
              The session is about to begin. Please wait.
            </p>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {SessionPhase === 'pre-button' && 'Get Ready!'}
            {SessionPhase === 'button-phase' && 'Press the Button!'}
            {SessionPhase === 'ended' && 'Thank You for Playing!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {SessionPhase === 'pre-button' && (
            <SessionCountDown
              countdownRemaining={countdown}
              countdownDuration={sessionConfig?.countdown_seconds || 0}
            />
          )}
          {SessionPhase === 'button-phase' && (
            <>
              <div className="w-full h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${buttonPhaseProgress}%` }}
                ></div>
              </div>
              <SessionButton
                cooldown={sessionConfig?.button_press_timeout_seconds || 0}
                onClick={handleButtonClick}
                disabled={SessionPhase !== 'button-phase'}
              />
            </>
          )}
          {SessionPhase === 'ended' && (
            <div className="space-y-4">
              <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
              {session?.final_score !== null ? (
                <div className="space-y-2">
                  <p className="text-xl text-muted-foreground">Your final score is</p>
                  <div className="text-5xl font-extrabold text-green-600">
                    {session?.final_score}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-4 h-4 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-4 h-4 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span className="text-lg text-muted-foreground ml-2">
                    Calculating final score...
                  </span>
                </div>
              )}
              <Button
                onClick={() => router.push(`/community/${session?.community_id}`)}
                className="mt-4"
              >
                Back to Community
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  )
}
