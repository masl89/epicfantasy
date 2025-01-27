"use client"

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useDungeon } from './DungeonContext'
import DungeonList from './DungeonList'
import ActiveBattle from './ActiveBattle'

const DungeonContent = () => {
  const { activeBattle, profile, setActiveBattle } = useDungeon()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Subscribe to battle updates
    const channel = supabase
      .channel('battle-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `profile_id=eq.${profile?.id}`
        },
        async (payload) => {
          if (payload.new) {
            const { data: updatedBattle } = await supabase
              .from('battles')
              .select(`
                *,
                monster:monsters(*)
              `)
              .eq('id', payload.new.id)
              .single()

            if (updatedBattle) {
              setActiveBattle(updatedBattle)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, supabase, setActiveBattle])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Dungeons</h1>
        
        {activeBattle ? (
          <ActiveBattle 
            battle={activeBattle} 
            profile={profile}
          />
        ) : (
          <DungeonList 
            dungeons={[]} // We'll fetch this in DungeonList component
            profile={profile}
          />
        )}
      </div>
    </div>
  )
}

export default DungeonContent 