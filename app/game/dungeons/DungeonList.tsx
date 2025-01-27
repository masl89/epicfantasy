"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/types/database'
import type { Dungeon, DungeonProgress } from '@/types/dungeon'
import DungeonDetails from './DungeonDetails'

interface DungeonListProps {
  profile: Profile
}

const DungeonList = ({ profile }: DungeonListProps) => {
  const supabase = createClientComponentClient()
  const [dungeons, setDungeons] = useState<(Dungeon & { progress: DungeonProgress[] })[]>([])
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDungeons = async () => {
      const { data } = await supabase
        .from('dungeons')
        .select(`
          *,
          progress:dungeon_progress(*)
        `)
        .order('min_level', { ascending: true })

      if (data) {
        setDungeons(data)
      }
    }

    fetchDungeons()
  }, [supabase])

  const getDungeonProgress = (dungeon: Dungeon) => {
    return dungeon.progress?.find(p => p.profile_id === profile.id)
  }

  const getDifficultyColor = (dungeon: Dungeon) => {
    const levelDiff = profile.level - dungeon.min_level
    if (levelDiff < 0) return 'text-red-600 dark:text-red-400'
    if (levelDiff > 5) return 'text-green-600 dark:text-green-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dungeons.map((dungeon) => {
          const progress = getDungeonProgress(dungeon)
          
          return (
            <div
              key={dungeon.id}
              onClick={() => setSelectedDungeon(dungeon)}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold">{dungeon.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dungeon.description}
              </p>
              
              <div className="mt-2 space-y-1">
                <p className={`text-sm font-medium ${getDifficultyColor(dungeon)}`}>
                  Level {dungeon.min_level}-{dungeon.max_level}
                </p>
                
                {progress && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Current Level: {progress.current_level}</p>
                    <p>Highest Level: {progress.highest_level}</p>
                    {progress.completed && (
                      <span className="text-green-600 dark:text-green-400">
                        Completed!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDungeon && (
        <DungeonDetails
          dungeon={selectedDungeon}
          profile={profile}
          progress={getDungeonProgress(selectedDungeon)}
          onClose={() => setSelectedDungeon(null)}
          onError={setError}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

export default DungeonList 