import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { PlusIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import DatePicker from '@/components/DatePicker'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { toast } from 'sonner'

const sessionSchema = z.object({
  scheduledDate: z.date(),
  scheduledTime: z.string().min(1, { message: 'Please select a time slot' }),
})

type SessionFormValues = z.infer<typeof sessionSchema>

interface CreateSessionDialogProps {
  communityId: string
}

export function CreateSessionDialog({ communityId }: CreateSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      scheduledDate: undefined,
      scheduledTime: undefined,
    },
  })

  const handleCreateSession = async (values: SessionFormValues) => {
    setIsLoading(true)
    try {
      if (!values.scheduledDate || !values.scheduledTime) {
        throw new Error('Please select both a date and time')
      }
      const [hours, minutes] = values.scheduledTime.split(':').map(Number)
      const scheduledDate = new Date(values.scheduledDate)
      scheduledDate.setHours(hours, minutes, 0, 0)

      const { error } = await supabase.from('session').insert([
        {
          community_id: communityId,
          scheduled_at: scheduledDate.toISOString(),
          created_by: user?.id ?? '',
        },
      ])

      if (error) throw error

      setIsOpen(false)
      form.reset()
      toast.success('Session created successfully!')
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        scheduledDate: undefined,
        scheduledTime: undefined,
      })
    }
  }, [isOpen, form])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-8 right-8 rounded-full w-16 h-16" size="icon">
          <PlusIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <Label className="pr-4">Date</Label>
                  <FormControl>
                    <DatePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <Label>Time Slot</Label>
                  <FormControl>
                    <TimeSlotPicker
                      onTimeSelect={field.onChange}
                      selectedDate={form.watch('scheduledDate')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
