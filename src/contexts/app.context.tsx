import { Tables } from '@/lib/database.types'
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { useAuth } from './auth.context'
import { supabase } from '@/lib/supabase/client'

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
        const { data, error } = await supabase.functions.invoke('discord', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: {
            discordProviderToken: dToken,
          },
        })
        if (error) throw error
        setCommunities(data)
        // Use the data here or return it
        // TODO: upsert communities to dataabase here
      } catch (error) {
        console.error('Failed to fetch guilds:', error)
        // Handle the error appropriately
      }
    }
    if (session && session.provider_token && communities === null)
      getCommunities(session.provider_token)
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
