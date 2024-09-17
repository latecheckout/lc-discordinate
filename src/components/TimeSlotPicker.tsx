import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type TimeSlot = {
  hour: number
  minute: number
}

interface TimeSlotPickerProps {
  onTimeSelect: (time: string) => void
  selectedDate: Date | null
}

export default function TimeSlotPicker({ onTimeSelect, selectedDate }: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[][]>([])
  const [selectedTimeState, setSelectedTimeState] = useState<string | null>(null)

  const isTimeDisabled = useCallback(
    (hour: number, minute: number) => {
      if (!selectedDate) return true // Disable all if no date is selected

      const now = new Date()
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hour, minute, 0, 0)

      if (
        slotTime.getDate() === now.getDate() &&
        slotTime.getMonth() === now.getMonth() &&
        slotTime.getFullYear() === now.getFullYear()
      ) {
        // If it's today, disable past times
        return slotTime <= now
      }

      // For future dates, enable all times
      return false
    },
    [selectedDate],
  )

  useEffect(() => {
    const generateTimeSlots = () => {
      const slots: TimeSlot[][] = []
      for (let hour = 0; hour < 24; hour++) {
        const hourSlots: TimeSlot[] = []
        for (let minute = 0; minute < 60; minute += 5) {
          hourSlots.push({ hour, minute })
        }
        slots.push(hourSlots)
      }
      setTimeSlots(slots)
    }

    generateTimeSlots()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      let firstAvailableFound = false

      timeSlots.forEach((hourSlots) => {
        hourSlots.forEach((slot) => {
          if (!firstAvailableFound && !isTimeDisabled(slot.hour, slot.minute)) {
            firstAvailableFound = true
            const slotElement = document.getElementById(`timeslot-${slot.hour}-${slot.minute}`)
            if (slotElement) {
              slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
        })
      })
    }
  }, [selectedDate, timeSlots, isTimeDisabled])

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  const handleTimeSelect = (hour: number, minute: number) => {
    const formattedTime = formatTime(hour, minute)
    setSelectedTimeState(formattedTime)
    onTimeSelect(formattedTime)
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <ScrollArea className="h-[300px] border rounded-md">
        <div className="grid grid-cols-4 gap-2 p-4">
          {timeSlots.map((hourSlots, hourIndex) => (
            <div key={hourIndex} className="space-y-2">
              <div className="font-semibold text-center text-sm text-muted-foreground">
                {hourIndex}:00
              </div>
              {hourSlots.map((slot) => {
                const isDisabled = isTimeDisabled(slot.hour, slot.minute)
                return (
                  <Button
                    key={`${slot.hour}-${slot.minute}`}
                    id={`timeslot-${slot.hour}-${slot.minute}`}
                    variant={
                      selectedTimeState === formatTime(slot.hour, slot.minute) ? 'default' : 'ghost'
                    }
                    className="w-full py-1 text-xs"
                    onClick={() => handleTimeSelect(slot.hour, slot.minute)}
                    disabled={isDisabled}
                    type="button"
                  >
                    {formatTime(slot.hour, slot.minute)}
                  </Button>
                )
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
