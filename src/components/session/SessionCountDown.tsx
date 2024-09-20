import { formatSecondsToMMSS } from '@/lib/utils'
import { FC, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

export const SessionCountDown: FC<{ countdownRemaining: number; countdownDuration: number }> = ({
  countdownRemaining,
  countdownDuration,
}) => {
  const circumference = 2 * Math.PI * 45
  const controls = useAnimation()

  useEffect(() => {
    const progress = (countdownRemaining / countdownDuration) * 100
    controls.start({
      strokeDashoffset: circumference * (1 - progress / 100),
      transition: { duration: 1.1, ease: 'linear' },
    })
  }, [countdownRemaining, countdownDuration, controls, circumference])

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
          <motion.circle
            className="text-blue-600 stroke-current"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={circumference}
            initial={false}
            animate={controls}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <motion.div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl font-bold">
            {formatSecondsToMMSS(Math.ceil(countdownRemaining))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
