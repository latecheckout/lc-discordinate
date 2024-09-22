import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const SessionButton: FC<{ cooldown: number; onClick: () => void; disabled?: boolean }> = ({
  cooldown,
  onClick,
  disabled,
}) => {
  const [lastButtonPress, setLastButtonPress] = useState<number>(0)
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0)

  const handleButtonClick = async () => {
    const now = Date.now() / 1000
    if (now - lastButtonPress < cooldown) return
    setLastButtonPress(now)
    onClick()
  }

  const isButtonEnabled = !disabled && remainingCooldown === 0

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now() / 1000
      const remaining = Math.max(0, cooldown - (now - lastButtonPress))
      setRemainingCooldown(remaining)
    }, 100)
    return () => clearInterval(timer)
  }, [lastButtonPress, cooldown])

  return (
    <motion.button
      className={`w-64 h-20 text-2xl text-white rounded-lg transition-colors duration-300 relative overflow-hidden
      ${
        isButtonEnabled
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer shadow-lg'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
      onClick={handleButtonClick}
      disabled={!isButtonEnabled}
      whileTap={isButtonEnabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="absolute inset-0 bg-gray-600 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isButtonEnabled ? 0 : remainingCooldown / cooldown }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
      <AnimatePresence mode="wait">
        {isButtonEnabled ? (
          <motion.span
            key="enabled"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            Click to Score!
          </motion.span>
        ) : (
          <motion.div
            key="disabled"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg z-10">{remainingCooldown.toFixed(1)}s</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
