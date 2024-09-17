import { useState } from 'react'
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
import DateTimePicker from '@/components/DateTimePicker'
import { toast } from 'sonner'

const sessionSchema = z.object({
  scheduledAt: z.date().min(new Date(), { message: 'Session date must be in the future' }),
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
      scheduledAt: undefined,
    },
  })

  const handleCreateSession = async (values: SessionFormValues) => {
    setIsLoading(true)
    try {
      if (!values.scheduledAt) {
        throw new Error('Please select both a date and time')
      }
      const { error } = await supabase.from('session').insert([
        {
          community_id: communityId,
          scheduled_at: values.scheduledAt.toISOString(),
          created_by: user?.id ?? '',
        },
      ])

      if (error) throw error

      setIsOpen(false)
      form.reset()
      toast.success('Session created successfully!')
    } catch (error) {
      console.error('Error creating session:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

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
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <Label>Date and Time</Label>
                  <FormControl>
                    <DateTimePicker date={field.value} setDate={field.onChange} />
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
