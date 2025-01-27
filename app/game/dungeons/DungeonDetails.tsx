"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/types/database'
import type { Dungeon, DungeonProgress } from '@/types/dungeon'
import { useDungeon } from './DungeonContext'

interface DungeonDetailsProps {
  dungeon: Dungeon
  profile: Profile
  progress?: DungeonProgress
  onClose: () => void
  onError: (error: string | null) => void
}

const DungeonDetails = ({ 
  dungeon, 
  profile, 
  progress, 
  onClose, 
  onError 
}: DungeonDetailsProps) => {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const { refreshData } = useDungeon()

  const handleEnterDungeon = async () => {
    try {
      setLoading(true)
      onError(null)

      if (profile.level < dungeon.min_level) {
        throw new Error(`You need to be level ${dungeon.min_level} to enter this dungeon`)
      }

      // Get or create dungeon progress
      let currentProgress = progress
      if (!currentProgress) {
        const { data: newProgress, error: progressError } = await supabase
          .from('dungeon_progress')
          .insert({
            profile_id: profile.id,
            dungeon_id: dungeon.id,
            current_level: 1,
            highest_level: 1
          })
          .select()
          .single()

        if (progressError) throw progressError
        currentProgress = newProgress
      }

      // Get monster for current level
      const { data: levelData, error: levelError } = await supabase
        .from('dungeon_levels')
        .select(`
          *,
          monster:monsters(*)
        `)
        .eq('dungeon_id', dungeon.id)
        .eq('level_number', currentProgress.current_level)
        .single()

      if (levelError) throw levelError

      // Start battle
      const { error: battleError } = await supabase
        .from('battles')
        .insert({
          profile_id: profile.id,
          dungeon_id: dungeon.id,
          dungeon_level: currentProgress.current_level,
          monster_id: levelData.monster_id,
          player_health: profile.max_health,
          monster_health: levelData.monster.health,
          status: 'in_progress',
          turns: []
        })

      if (battleError) throw battleError

      // Log the dungeon entry
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'enter_dungeon',
          description: `Entered ${dungeon.name} - Level ${currentProgress.current_level}`
        })

      await refreshData()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{dungeon.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {dungeon.description}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Required Level:</span>{' '}
              <span className={profile.level < dungeon.min_level ? 'text-red-600' : 'text-green-600'}>
                {dungeon.min_level}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Maximum Level:</span>{' '}
              {dungeon.max_level}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Levels:</span>{' '}
              {dungeon.levels}
            </p>
          </div>

          {progress && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your Progress</h4>
              <div className="space-y-1 text-sm">
                <p>Current Level: {progress.current_level}</p>
                <p>Highest Level: {progress.highest_level}</p>
                {progress.completed && (
                  <p className="text-green-600 dark:text-green-400">
                    Dungeon Completed!
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleEnterDungeon}
            disabled={loading || profile.level < dungeon.min_level}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter Dungeon'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DungeonDetails 