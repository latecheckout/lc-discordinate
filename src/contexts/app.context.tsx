import { Tables } from '@/lib/database.types'
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { useAuth } from './auth.context'
import { fetchCommunities } from '@/lib/supabase/communityOperations'

// Define the shape of your context
interface AppContextType {
  // Add your state variables here
  // Add more state and functions as needed
  communities: Tables<'community'>[]
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Create a provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add more state variables and functions as needed
  const { session, user } = useAuth()
  const [communities, setCommunities] = useState<Tables<'community'>[] | null>(null)
  const value = {
    // Include other state and functions here
    communities: communities ?? [],
  }

  useEffect(() => {
    const getCommunities = async (dToken: string) => {
      try {
        if (!session?.access_token) {
          throw new Error('No access token available')
        }
        const communities = await fetchCommunities(dToken, session.access_token)

        if (!user?.id) {
          throw new Error('No user ID available')
        }

        setCommunities(communities)
      } catch (error) {
        console.error('Failed to process communities:', error)
        // Handle the error appropriately
      }
    }

    if (session?.provider_token && communities === null) {
      getCommunities(session.provider_token)
    }
  }, [user, session, communities])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Create a custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
