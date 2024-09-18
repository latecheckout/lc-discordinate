import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { differenceInSeconds, addMinutes, format, addSeconds } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'

const SESSION_DURATION_MINUTES = 5

export default function SessionPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const [session, setSession] = useState<Tables<'session'> | null>(null)
  const [countdown, setCountdown] = useState('')
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(100)
  const [isSessionOver, setIsSessionOver] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      if (sessionId) {
        const { data, error } = await supabase
          .from('session')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (error) {
          console.error('Error fetching session:', error)
        } else {
          setSession(data)
        }
      }
    }

    fetchSession()
  }, [sessionId])

  useEffect(() => {
    if (!session) return

    const timer = setInterval(() => {
      const now = new Date()
      const sessionStart = new Date(session.scheduled_at)
      const sessionEnd = addMinutes(sessionStart, SESSION_DURATION_MINUTES)
      const secondsToStart = differenceInSeconds(sessionStart, now)
      const secondsToEnd = differenceInSeconds(sessionEnd, now)

      if (secondsToStart > 0) {
        setCountdown(format(addSeconds(new Date(0), secondsToStart), 'mm:ss'))
        setIsButtonEnabled(false)
      } else if (secondsToEnd > 0) {
        const progress = (secondsToEnd / (SESSION_DURATION_MINUTES * 60)) * 100
        setSessionProgress(progress)
        setIsButtonEnabled(true)
        setCountdown('')
      } else {
        setIsSessionOver(true)
        setIsButtonEnabled(false)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session])

  const handleButtonClick = async () => {
    if (isButtonEnabled && session) {
      const { data, error } = await supabase.functions.invoke('button', {
        body: { session_id: session.id },
      })
      console.log('Response:', data, error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {!isSessionOver && countdown && (
        <div
          className={`text-4xl font-bold mb-4 ${countdown.length <= 2 ? 'text-red-600' : 'text-gray-800'}`}
        >
          Session starts in: {countdown}
        </div>
      )}
      {!isSessionOver && !countdown && (
        <>
          <div className="text-2xl font-bold mb-4 text-gray-800">Session in progress</div>
          <div className="w-72 h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000 ease-linear"
              style={{ width: `${sessionProgress}%` }}
            ></div>
          </div>
        </>
      )}
      {isSessionOver ? (
        <div className="text-2xl font-bold text-gray-800">Session has ended</div>
      ) : (
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
      )}
    </div>
  )
}
