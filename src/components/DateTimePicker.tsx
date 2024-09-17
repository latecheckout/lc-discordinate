import { useState, Dispatch, SetStateAction } from 'react'
import { CalendarIcon, Clock } from 'lucide-react'
import { format, isToday, isBefore, startOfDay } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateTimePickerProps {
  date: Date | null
  setDate: Dispatch<SetStateAction<Date | null>>
}

export default function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [time, setTime] = useState<string | null>(null)

  const now = new Date()
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const newDateTime = new Date(newDate)
      if (time) {
        const [hours, minutes] = time.split(':')
        newDateTime.setHours(parseInt(hours), parseInt(minutes))
      } else {
        newDateTime.setHours(0, 0, 0, 0) // Set to start of day if no time selected
      }
      setDate(newDateTime)
    } else {
      setDate(null)
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      setDate(newDate)
    }
  }

  const isDateDisabled = (day: Date) => {
    return isBefore(day, startOfDay(now))
  }

  const isHourDisabled = (hour: string) => {
    if (!date || !isToday(date)) return false
    return parseInt(hour) < now.getHours()
  }

  const isMinuteDisabled = (minute: string) => {
    if (!date || !isToday(date) || !time) return false
    const [selectedHour] = time.split(':')
    if (parseInt(selectedHour) > now.getHours()) return false
    return parseInt(selectedHour) === now.getHours() && parseInt(minute) <= now.getMinutes()
  }

  return (
    <div className="flex space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleDateChange}
            disabled={isDateDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !time && 'text-muted-foreground',
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time || <span>Pick a time</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex p-2">
            <Select
              value={time?.split(':')[0]}
              onValueChange={(value) => handleTimeChange(`${value}:${time?.split(':')[1] || '00'}`)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour} disabled={isHourDisabled(hour)}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="mx-2 text-2xl">:</span>
            <Select
              value={time?.split(':')[1]}
              onValueChange={(value) => handleTimeChange(`${time?.split(':')[0] || '00'}:${value}`)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute} disabled={isMinuteDisabled(minute)}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
