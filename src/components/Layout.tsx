import Header from '@/components/Header'
import { useAuth } from '@/contexts/auth.context'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { status } = useAuth()
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
      <Header />
      <Toaster />
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">{children}</main>
    </div>
  )
}
