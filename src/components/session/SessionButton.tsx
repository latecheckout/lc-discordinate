import { FC, useState } from 'react'

export const SessionButton: FC<{ cooldown: number; onClick: () => void; disabled?: boolean }> = ({
  cooldown,
  onClick,
  disabled,
}) => {
  const [lastButtonPress, setLastButtonPress] = useState<number>(0)
  const handleButtonClick = async () => {
    const now = Date.now() / 1000
    if (now - lastButtonPress < cooldown) return
    setLastButtonPress(now)
    onClick()
  }
  const isButtonEnabled = !disabled && Date.now() / 1000 - lastButtonPress > cooldown
  return (
    <button
      className={`px-8 py-4 text-2xl text-white rounded-lg transition-colors duration-300
      ${
        isButtonEnabled
          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          : 'bg-red-600 cursor-not-allowed'
      }`}
      onClick={handleButtonClick}
      disabled={!isButtonEnabled}
    >
      {isButtonEnabled ? 'Discordinate!' : 'Waiting...'}
    </button>
  )
}
