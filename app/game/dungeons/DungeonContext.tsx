"use client"

import { createContext, useContext, useState } from 'react'
import type { Battle, Dungeon, DungeonProgress } from '@/types/dungeon'
import type { Profile } from '@/types/database'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DungeonContextType {
  activeBattle: Battle | null
  setActiveBattle: (battle: Battle | null) => void
  profile: Profile | null
  setProfile: (profile: Profile) => void
  refreshData: () => Promise<void>
}

const DungeonContext = createContext<DungeonContextType | undefined>(undefined)

export const DungeonProvider = ({ 
  children,
  initialProfile,
  initialBattle
}: { 
  children: React.ReactNode
  initialProfile: Profile
  initialBattle: Battle | null
}) => {
  const [activeBattle, setActiveBattle] = useState<Battle | null>(initialBattle)
  const [profile, setProfile] = useState<Profile>(initialProfile)

  const refreshData = async () => {
    // Refresh profile and battle data without page reload
    const supabase = createClientComponentClient()
    
    const [profileData, battleData] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single(),
      supabase
        .from('battles')
        .select(`
          *,
          monster:monsters(*)
        `)
        .eq('profile_id', profile.id)
        .eq('status', 'in_progress')
        .single()
    ])

    if (profileData.data) {
      setProfile(profileData.data)
    }
    setActiveBattle(battleData.data)
  }

  return (
    <DungeonContext.Provider 
      value={{ 
        activeBattle, 
        setActiveBattle,
        profile,
        setProfile,
        refreshData
      }}
    >
      {children}
    </DungeonContext.Provider>
  )
}

export const useDungeon = () => {
  const context = useContext(DungeonContext)
  if (context === undefined) {
    throw new Error('useDungeon must be used within a DungeonProvider')
  }
  return context
} 