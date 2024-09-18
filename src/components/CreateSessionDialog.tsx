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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import DatePicker from '@/components/DatePicker'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { toast } from 'sonner'

const sessionSchema = z.object({
  sessionType: z.enum(['scheduled', 'queue']),
  scheduledDate: z.date().optional(),
  scheduledTime: z.string().optional(),
})

type SessionFormValues = z.infer<typeof sessionSchema>

interface CreateSessionDialogProps {
  communityId: string
  onSessionCreated: () => void
}

export function CreateSessionDialog({ communityId, onSessionCreated }: CreateSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      sessionType: 'queue',
      scheduledDate: undefined,
      scheduledTime: undefined,
    },
  })

  const handleCreateSession = async (values: SessionFormValues) => {
    setIsLoading(true)
    try {
      if (values.sessionType === 'scheduled') {
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
      } else {
        // Handle queue join
        const { error } = await supabase.rpc('join_session_queue', {
          p_community_id: communityId,
        })

        if (error) throw error
      }

      setIsOpen(false)
      form.reset()
      toast.success(
        values.sessionType === 'scheduled'
          ? 'Session created successfully!'
          : 'Joined the queue successfully!',
      )
      onSessionCreated()
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
        sessionType: 'queue',
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
              name="sessionType"
              render={({ field }) => (
                <FormItem>
                  <Label>Session Type</Label>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="queue" />
                        </FormControl>
                        <Label className="font-normal">Join the queue</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="scheduled" />
                        </FormControl>
                        <Label className="font-normal">Schedule a session</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('sessionType') === 'scheduled' && (
              <>
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="pr-4">Date</Label>
                      <FormControl>
                        <DatePicker date={field.value || null} setDate={field.onChange} />
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
                          selectedDate={form.watch('scheduledDate') || null}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Creating...'
                : form.watch('sessionType') === 'scheduled'
                  ? 'Create Session'
                  : 'Join Queue'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
