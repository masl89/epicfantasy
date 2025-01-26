"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/types/database'

interface CharacterStatsProps {
  profile: Profile
}

const classDescriptions = {
  warrior: 'A mighty fighter skilled in combat and physical prowess.',
  mage: 'A wielder of arcane magic with high intelligence.',
  rogue: 'A nimble fighter specializing in speed and precision.'
}

const StatBar = ({ current, max, label }: { current: number; max: number; label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{current}/{max}</span>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 rounded-full"
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  </div>
)

const CharacterStats = ({ profile }: CharacterStatsProps) => {
  const supabase = createClientComponentClient()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdateUsername = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Calculate experience needed for next level
  const expForNextLevel = profile.level * 100
  const expProgress = profile.experience % 100

  return (
    <div className="space-y-6">
      {/* Character Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                  placeholder="Enter username"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setUsername(profile.username)
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">{profile.username}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Level {profile.level} {profile.character_class}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {classDescriptions[profile.character_class]}
          </p>
        </div>

        <div className="space-y-4">
          <StatBar 
            current={profile.health} 
            max={profile.max_health} 
            label="Health" 
          />
          <StatBar 
            current={expProgress} 
            max={100} 
            label="Experience" 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Strength</h3>
          <p className="text-2xl font-bold">{profile.strength}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Increases physical damage and carrying capacity
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Intelligence</h3>
          <p className="text-2xl font-bold">{profile.intelligence}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Increases magical damage and mana pool
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Dexterity</h3>
          <p className="text-2xl font-bold">{profile.dexterity}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Increases speed and critical hit chance
          </p>
        </div>
      </div>

      {/* Other Stats */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Other Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gold</p>
            <p className="text-lg font-bold">{profile.gold}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Level</p>
            <p className="text-lg font-bold">{expForNextLevel} exp</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

export default CharacterStats 