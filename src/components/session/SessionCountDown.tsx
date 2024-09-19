import { formatSecondsToMMSS } from '@/lib/utils'
import { FC, useEffect, useState } from 'react'

export const SessionCountDown: FC<{ countdownRemaining: number; countdownDuration: number }> = ({
  countdownRemaining,
  countdownDuration,
}) => {
  const [progress, setProgress] = useState(100)
  const circumference = 2 * Math.PI * 45

  useEffect(() => {
    setProgress((countdownRemaining / countdownDuration) * 100)
  }, [countdownRemaining, countdownDuration])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
          />
          <circle
            className="text-blue-600 stroke-current"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="text-5xl font-bold">
            {formatSecondsToMMSS(Math.ceil(countdownRemaining))}
          </div>
        </div>
      </div>
    </div>
  )
}
