import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { differenceInSeconds, addMinutes, format, addSeconds } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'

const SESSION_DURATION_MINUTES = 5

interface SessionConfig {
  countdown_seconds: number
  button_press_seconds: number
  button_press_timeout_seconds: number
}

export default function SessionPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const [session, setSession] = useState<Tables<'session'> | null>(null)
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)
  const [countdown, setCountdown] = useState('')
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [sessionState, setSessionState] = useState<
    'countdown' | 'pre-button' | 'button-phase' | 'post-button' | 'ended'
  >('countdown')
  const [buttonPhaseProgress, setButtonPhaseProgress] = useState(0)

  useEffect(() => {
    async function fetchSessionAndConfig() {
      if (sessionId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('session')
          .select('*, config:session_config(*)')
          .eq('id', sessionId)
          .single()

        if (sessionError) {
          console.error('Error fetching session:', sessionError)
        } else {
          setSession(sessionData)
          setSessionConfig(sessionData.config)
        }
      }
    }

    fetchSessionAndConfig()
  }, [sessionId])

  useEffect(() => {
    if (!session || !sessionConfig) return

    const timer = setInterval(() => {
      const now = new Date()
      const sessionStart = new Date(session.scheduled_at)
      const buttonPhaseStart = addSeconds(sessionStart, sessionConfig.countdown_seconds)
      const buttonPhaseEnd = addSeconds(buttonPhaseStart, sessionConfig.button_press_seconds)
      const sessionEnd = addMinutes(sessionStart, SESSION_DURATION_MINUTES)

      const secondsToStart = differenceInSeconds(sessionStart, now)
      const secondsToButtonPhase = differenceInSeconds(buttonPhaseStart, now)
      const secondsToButtonPhaseEnd = differenceInSeconds(buttonPhaseEnd, now)
      const secondsToEnd = differenceInSeconds(sessionEnd, now)

      if (secondsToStart > 0) {
        setSessionState('countdown')
        setCountdown(format(addSeconds(new Date(0), secondsToStart), 'mm:ss'))
        setIsButtonEnabled(false)
        setButtonPhaseProgress(100)
      } else if (secondsToButtonPhase > 0) {
        setSessionState('pre-button')
        setCountdown(format(addSeconds(new Date(0), secondsToButtonPhase), 'mm:ss'))
        setIsButtonEnabled(false)
        setButtonPhaseProgress(100)
      } else if (secondsToButtonPhaseEnd > 0) {
        setSessionState('button-phase')
        setCountdown(format(addSeconds(new Date(0), secondsToButtonPhaseEnd), 'ss'))
        setIsButtonEnabled(true)
        const progress = (secondsToButtonPhaseEnd / sessionConfig.button_press_seconds) * 100
        setButtonPhaseProgress(progress)
      } else if (secondsToEnd > 0) {
        setSessionState('post-button')
        setCountdown(format(addSeconds(new Date(0), secondsToEnd), 'mm:ss'))
        setIsButtonEnabled(false)
        setButtonPhaseProgress(0)
      } else {
        setSessionState('ended')
        setIsButtonEnabled(false)
        setButtonPhaseProgress(0)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session, sessionConfig])

  const handleButtonClick = async () => {
    if (isButtonEnabled && session && sessionConfig) {
      setIsButtonEnabled(false)
      const { data, error } = await supabase.functions.invoke('button', {
        body: { session_id: session.id },
      })
      console.log('Response:', data, error)

      // Re-enable the button after the timeout
      setTimeout(() => {
        setIsButtonEnabled(true)
      }, sessionConfig.button_press_timeout_seconds * 1000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {sessionState === 'countdown' && (
        <div className="text-4xl font-bold mb-4 text-gray-800">Session starts in: {countdown}</div>
      )}
      {sessionState === 'pre-button' && (
        <div className="text-4xl font-bold mb-4 text-gray-800">
          Button phase starts in: {countdown}
        </div>
      )}
      {sessionState === 'button-phase' && (
        <div className="text-4xl font-bold mb-4 text-red-600">Press the button!</div>
      )}
      {sessionState === 'post-button' && (
        <div className="text-4xl font-bold mb-4 text-gray-800">
          Button phase ended. Session ends in: {countdown}
        </div>
      )}
      {sessionState === 'button-phase' && (
        <div className="w-72 h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${buttonPhaseProgress}%` }}
          ></div>
        </div>
      )}
      {sessionState === 'ended' ? (
        <div className="text-2xl font-bold text-gray-800">Session has ended</div>
      ) : sessionState === 'button-phase' || sessionState === 'pre-button' ? (
        <button
          className={`px-8 py-4 text-2xl text-white rounded-lg transition-colors duration-300
            ${
              isButtonEnabled
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          onClick={handleButtonClick}
          disabled={!isButtonEnabled}
        >
          {isButtonEnabled ? 'Discordinate!' : 'Waiting...'}
        </button>
      ) : null}
    </div>
  )
}
