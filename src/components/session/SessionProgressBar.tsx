import React, { useEffect } from 'react'
import { motion, useTransform, useMotionValue } from 'framer-motion'
import { SessionButton } from './SessionButton'

interface SessionProgressBarProps {
  buttonPhaseProgress: number
  currentScore: number | null
  sessionConfig: { button_press_timeout_seconds: number } | null
  onButtonClick: () => void
  sessionPhase: string
}

export const SessionProgressBar: React.FC<SessionProgressBarProps> = ({
  buttonPhaseProgress,
  currentScore,
  sessionConfig,
  onButtonClick,
  sessionPhase,
}) => {
  const progress = useMotionValue(buttonPhaseProgress)
  const color = useTransform(
    progress,
    [0, 25, 50, 75, 100],
    [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#22c55e', // green
    ],
  )

  useEffect(() => {
    progress.set(buttonPhaseProgress)
  }, [buttonPhaseProgress, progress])

  return (
    <>
      <div className="w-full h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            backgroundColor: color,
          }}
          animate={{ width: `${buttonPhaseProgress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
      {currentScore !== null && (
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg font-semibold">Community Score</p>
          <p className="text-3xl font-bold text-primary">{currentScore}</p>
        </motion.div>
      )}
      <SessionButton
        cooldown={sessionConfig?.button_press_timeout_seconds || 0}
        onClick={onButtonClick}
        disabled={sessionPhase !== 'button-phase'}
      />
    </>
  )
}
