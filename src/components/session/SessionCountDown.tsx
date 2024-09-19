import { formatSecondsToMMSS } from '@/lib/utils'
import { FC } from 'react'

export const SessionCountDown: FC<{ countdown: number }> = ({ countdown }) => {
  return (
    <div className="text-4xl font-bold mb-4 text-gray-800">{formatSecondsToMMSS(countdown)}</div>
  )
}
