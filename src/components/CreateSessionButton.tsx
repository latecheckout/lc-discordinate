import { FC } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useApp } from '@/contexts/app.context'

export const CreateSessionButton: FC<{ communityId: string }> = ({ communityId }) => {
  const { fetchUpcomingSession } = useApp()

  const handleCreateSession = async () => {
    try {
      // Handle queue join
      const { error } = await supabase.rpc('join_session_queue', {
        p_community_id: communityId,
      })

      if (error) throw error

      toast.success('Joined the queue successfully!')
      fetchUpcomingSession(communityId)
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session. Please try again.')
    }
  }

  return (
    <Button className="fixed bottom-8 right-8 rounded-full" onClick={handleCreateSession}>
      JOIN QUEUE
    </Button>
  )
}
