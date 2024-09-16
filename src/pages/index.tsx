import { useAuth } from '@/contexts/auth.context'
import { useRouter } from 'next/router'
import { use, useEffect } from 'react'

export default function Home() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <div>Welcome, {user?.email}</div>
}
