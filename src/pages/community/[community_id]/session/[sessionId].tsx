import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'
import { fetchSessionAndConfig } from '@/lib/supabase/communityOperations'
import { SessionCountDown } from '@/components/session/SessionCountDown'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClockIcon } from 'lucide-react'
import { useApp } from '@/contexts/app.context'
import { SessionProgressBar } from '@/components/session/SessionProgressBar'
import { motion } from 'framer-motion'
import { AnimatedCheckmark } from '@/components/AnimatedCheckmark'

interface SessionConfig {
  countdown_seconds: number
  button_press_seconds: number
  button_press_timeout_seconds: number
}

type SessionPhase = 'countdown' | 'pre-button' | 'button-phase' | 'ended'

export default function SessionPage() {
  const router = useRouter()
  const { fetchUpcomingAndOngoingSession } = useApp()
  const { sessionId } = router.query
  const [session, setSession] = useState<Tables<'session'> | null>(null)
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [SessionPhase, setSessionPhase] = useState<SessionPhase>('countdown')
  const [buttonPhaseProgress, setButtonPhaseProgress] = useState(0)
  const [currentScore, setCurrentScore] = useState<number | null>(null)

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
        fetchUpcomingAndOngoingSession(session.community_id)
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
  }, [session, sessionConfig, fetchSessionData, fetchUpcomingAndOngoingSession])

  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`session_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'session',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.new && 'current_score' in payload.new) {
            setCurrentScore(payload.new.current_score as number)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

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
            {SessionPhase === 'ended' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Session Complete!
              </motion.div>
            )}
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
            <SessionProgressBar
              buttonPhaseProgress={buttonPhaseProgress}
              currentScore={currentScore}
              sessionConfig={sessionConfig}
              onButtonClick={handleButtonClick}
              sessionPhase={SessionPhase}
            />
          )}
          {SessionPhase === 'ended' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                className="flex justify-center"
              >
                <AnimatedCheckmark />
              </motion.div>
              {session?.final_score !== null ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <p className="text-xl text-muted-foreground">Your final score is</p>
                  <motion.div
                    className="text-6xl font-extrabold text-green-600"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.7 }}
                  >
                    {session?.final_score}
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-4 h-4 bg-primary rounded-full"
                      animate={{ y: ['0%', '-50%', '0%'] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                  <span className="text-lg text-muted-foreground ml-2">
                    Calculating final score...
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button
                  onClick={() => router.push(`/community/${session?.community_id}`)}
                  className="mt-4 px-6 py-3 text-lg"
                >
                  Back to Community
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </Layout>
  )
}
