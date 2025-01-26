"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile, Quest } from '@/types/database'
import { DIFFICULTY_MULTIPLIERS, getDifficultyStyles } from '@/lib/quest-utils'

interface QuestBoardProps {
  profile: Profile
  quests: Quest[]
}

const QuestBoard = ({ profile, quests }: QuestBoardProps) => {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAcceptQuest = async (quest: Quest) => {
    try {
      setLoading(true)
      setError(null)

      const { error: questError } = await supabase
        .from('player_quests')
        .insert({
          profile_id: profile.id,
          quest_id: quest.id,
          status: 'active',
          progress: 0
        })

      if (questError) throw questError

      // Log the quest acceptance
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'accept_quest',
          description: `Accepted quest: ${quest.title}`
        })

      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderRewards = (quest: Quest) => {
    const styles = getDifficultyStyles(quest.difficulty)
    const multipliers = DIFFICULTY_MULTIPLIERS[quest.difficulty]

    return (
      <div className="space-y-2">
        <p className="font-medium">Rewards:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.border} border`}>
            <p className="text-sm font-medium">Experience</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${styles.text}`}>
                {quest.experience_reward}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({multipliers.experience}x base)
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.border} border`}>
            <p className="text-sm font-medium">Gold</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${styles.text}`}>
                {quest.gold_reward}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({multipliers.gold}x base)
              </span>
            </div>
          </div>
        </div>

        {(quest.item_reward || multipliers.itemChance > 0) && (
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.border} border`}>
            <p className="text-sm font-medium">Items</p>
            <ul className="space-y-1">
              {quest.item_reward && (
                <li className="flex items-center gap-2">
                  <span className="text-sm">
                    {quest.item_reward.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                    Guaranteed
                  </span>
                </li>
              )}
              {multipliers.itemChance > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-sm">
                    Bonus Item
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                    {Math.round(multipliers.itemChance * 100)}% chance
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quest Board</h2>
        <div className="flex gap-2">
          {Object.entries(DIFFICULTY_MULTIPLIERS).map(([difficulty, multipliers]) => (
            <div
              key={difficulty}
              className={`px-2 py-1 rounded-lg text-sm ${
                getDifficultyStyles(difficulty as QuestDifficulty).bg
              }`}
            >
              <span className={getDifficultyStyles(difficulty as QuestDifficulty).text}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                {multipliers.experience}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {quests.length > 0 ? (
        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`
                p-4 rounded-lg border-2 transition-colors
                ${getDifficultyStyles(quest.difficulty).border}
                ${getDifficultyStyles(quest.difficulty).bg}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{quest.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${getDifficultyStyles(quest.difficulty).text}`}>
                      {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Level {quest.level_requirement}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {quest.description}
                  </p>
                </div>
              </div>

              {renderRewards(quest)}

              <button
                onClick={() => handleAcceptQuest(quest)}
                disabled={loading}
                className={`
                  w-full px-4 py-2 text-white rounded-lg mt-4
                  ${getDifficultyStyles(quest.difficulty).progress}
                  hover:opacity-90 disabled:opacity-50
                `}
              >
                {loading ? 'Accepting...' : 'Accept Quest'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No quests available at your level. Level up to unlock more quests!
        </p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

export default QuestBoard 