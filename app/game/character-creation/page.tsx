"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { CharacterClass } from '@/types/database'

const characterClasses: Record<CharacterClass, {
  name: string
  description: string
  stats: {
    strength: number
    intelligence: number
    dexterity: number
  }
}> = {
  warrior: {
    name: 'Warrior',
    description: 'A mighty fighter skilled in combat and physical prowess.',
    stats: {
      strength: 15,
      intelligence: 8,
      dexterity: 10
    }
  },
  mage: {
    name: 'Mage',
    description: 'A wielder of arcane magic with high intelligence.',
    stats: {
      strength: 6,
      intelligence: 15,
      dexterity: 8
    }
  },
  rogue: {
    name: 'Rogue',
    description: 'A nimble fighter specializing in speed and precision.',
    stats: {
      strength: 8,
      intelligence: 10,
      dexterity: 15
    }
  }
}

const CharacterCreation = () => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null)
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) {
      setError('Please select a character class')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          character_class: selectedClass,
          strength: characterClasses[selectedClass].stats.strength,
          intelligence: characterClasses[selectedClass].stats.intelligence,
          dexterity: characterClasses[selectedClass].stats.dexterity
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Log the character creation
      await supabase
        .from('activity_log')
        .insert({
          profile_id: user.id,
          activity_type: 'character_creation',
          description: `Created a new ${selectedClass} character named ${username}`
        })

      router.push('/game')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Your Character</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose your class and begin your adventure
          </p>
        </div>

        <form onSubmit={handleCreateCharacter} className="space-y-6">
          {/* Username Input */}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Character Name
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Enter character name"
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose Your Class
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(characterClasses) as [CharacterClass, typeof characterClasses.warrior][]).map(([classKey, classData]) => (
                <button
                  key={classKey}
                  type="button"
                  onClick={() => setSelectedClass(classKey)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedClass === classKey
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  tabIndex={0}
                  aria-label={`Select ${classData.name} class`}
                >
                  <h3 className="font-bold text-lg">{classData.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {classData.description}
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Strength: {classData.stats.strength}</p>
                    <p>Intelligence: {classData.stats.intelligence}</p>
                    <p>Dexterity: {classData.stats.dexterity}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedClass || !username}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            tabIndex={0}
            aria-label="Create your character"
          >
            {loading ? 'Creating character...' : 'Create Character'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CharacterCreation 