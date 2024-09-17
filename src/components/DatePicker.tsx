import { Dispatch, SetStateAction, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, isBefore, startOfDay } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  date: Date | null
  setDate: Dispatch<SetStateAction<Date | null>>
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const now = new Date()
  const [open, setOpen] = useState(false)

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const newDateTime = new Date(newDate)
      newDateTime.setHours(0, 0, 0, 0) // Set to start of day
      setDate(newDateTime)
    } else {
      setDate(null)
    }
    setOpen(false)
  }

  const isDateDisabled = (day: Date) => {
    return isBefore(day, startOfDay(now))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
  )
}
