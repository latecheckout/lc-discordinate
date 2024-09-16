import { useApp } from '@/contexts/app.context'
import { useAuth } from '@/contexts/auth.context'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { user, status } = useAuth()
  const { communities } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-card shadow-xl rounded-lg overflow-hidden">
          <div className="bg-primary px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-primary-foreground">Welcome, {user?.email}</h1>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Communities</h2>
            {communities && communities.length > 0 ? (
              <ul className="divide-y divide-border">
                {communities.map((community, index) => (
                  <li
                    key={index}
                    className="py-4 flex items-center hover:bg-accent transition duration-150 ease-in-out"
                  >
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">{community.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">
                You are not a member of any communities yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
