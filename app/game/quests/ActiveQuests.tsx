"use client"

import { useState, useCallback, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile, PlayerQuest, QuestDifficulty } from '@/types/database'

interface ActiveQuestsProps {
  profile: Profile
  quests: PlayerQuest[]
  onProfileUpdate?: (newProfile: Partial<Profile>) => void
}

const PROGRESS_INTERVAL = 10000 // 10 seconds

// Progress rates per difficulty (% per interval)
const DIFFICULTY_RATES: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 5,
  hard: 3,
  epic: 1
}

// Level bonus multiplier (every 10 levels above requirement)
const LEVEL_BONUS_MULTIPLIER = 1.5
const LEVEL_BONUS_THRESHOLD = 10

const ActiveQuests = ({ profile, quests: initialQuests, onProfileUpdate }: ActiveQuestsProps) => {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quests, setQuests] = useState<PlayerQuest[]>(initialQuests)

  const calculateProgressRate = useCallback((quest: PlayerQuest) => {
    if (!quest.quest) return 0

    const baseRate = DIFFICULTY_RATES[quest.quest.difficulty]
    
    // Calculate level bonus
    const levelDifference = profile.level - quest.quest.level_requirement
    const levelBonusMultiplier = levelDifference >= LEVEL_BONUS_THRESHOLD
      ? Math.floor(levelDifference / LEVEL_BONUS_THRESHOLD) * LEVEL_BONUS_MULTIPLIER
      : 1

    return Math.round(baseRate * levelBonusMultiplier)
  }, [profile.level])

  const getEstimatedTimeRemaining = (quest: PlayerQuest) => {
    const progressRate = calculateProgressRate(quest)
    if (!progressRate) return null

    const remainingProgress = 100 - quest.progress
    const intervalsNeeded = Math.ceil(remainingProgress / progressRate)
    const timeInSeconds = (intervalsNeeded * PROGRESS_INTERVAL) / 1000

    if (timeInSeconds < 60) return `${timeInSeconds}s`
    if (timeInSeconds < 3600) return `${Math.ceil(timeInSeconds / 60)}m`
    return `${Math.ceil(timeInSeconds / 3600)}h`
  }

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-blue-600 dark:text-blue-400'
      case 'hard': return 'text-purple-600 dark:text-purple-400'
      case 'epic': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('quest-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_quests',
          filter: `profile_id=eq.${profile.id}`
        },
        async (payload) => {
          // Fetch the updated quest with all related data
          const { data: updatedQuest } = await supabase
            .from('player_quests')
            .select(`
              *,
              quest:quests(
                *,
                item_reward:items(*)
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (updatedQuest) {
            setQuests(currentQuests =>
              currentQuests.map(q =>
                q.id === updatedQuest.id ? updatedQuest : q
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, profile.id])

  // Modify the progress update effect
  useEffect(() => {
    if (!profile.id) return;

    const interval = setInterval(async () => {
      // Fetch current quest states
      const { data: currentQuests } = await supabase
        .from('current_player_quests')
        .select()
        .eq('profile_id', profile.id)
        .not('status', 'eq', 'completed');

      if (currentQuests) {
        // Transform the data to match the expected format
        const transformedQuests = currentQuests.map(q => ({
          ...q,
          progress: q.current_progress,
          quest: {
            title: q.quest_title,
            description: q.quest_description,
            difficulty: q.quest_difficulty,
            level_requirement: q.level_requirement,
            experience_reward: q.experience_reward,
            gold_reward: q.gold_reward,
            item_reward_id: q.item_reward_id,
            item_reward: q.item_reward_name ? {
              name: q.item_reward_name,
              description: q.item_reward_description
            } : null
          }
        }));
        setQuests(transformedQuests);
      }
    }, PROGRESS_INTERVAL);

    return () => clearInterval(interval);
  }, [profile.id]);

  const toggleQuestWork = async (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    try {
      setLoading(true)
      const newWorkingState = !quest.is_working

      // Call the appropriate function with correct parameter name
      const { error: updateError } = await supabase
        .rpc(newWorkingState ? 'start_quest_work' : 'stop_quest_work', {
          quest_id_param: questId
        })

      if (updateError) throw updateError

      // Update local state
      setQuests(currentQuests =>
        currentQuests.map(q =>
          q.id === questId
            ? { ...q, is_working: newWorkingState }
            : q
        )
      )

      try {
        // Log the action
        await supabase
          .from('activity_log')
          .insert({
            profile_id: profile.id,
            activity_type: newWorkingState ? 'start_quest_work' : 'stop_quest_work',
            description: `${newWorkingState ? 'Started' : 'Stopped'} working on quest: ${quest.quest?.title}`
          })
      } catch (logError) {
        // Don't fail the whole operation if logging fails
        console.warn('Failed to log activity:', logError)
      }
    } catch (error) {
      console.error('Toggle work error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteQuest = async (quest: PlayerQuest) => {
    try {
      setLoading(true)
      setError(null)

      if (!quest.quest) return

      // Stop progress tracking
      setQuests(currentQuests => 
        currentQuests.filter(q => q.id !== quest.id)
      )

      // First get the current profile to ensure we have the latest values
      const { data: currentProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('experience, gold')
        .eq('id', profile.id)
        .single()

      if (profileFetchError) throw profileFetchError

      // Calculate new values
      const newExperience = (currentProfile?.experience || 0) + quest.quest.experience_reward
      const newGold = (currentProfile?.gold || 0) + quest.quest.gold_reward

      // Update quest status
      const { error: questError } = await supabase
        .from('player_quests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          is_working: false
        })
        .eq('id', quest.id)

      if (questError) throw questError

      // Award experience and gold
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          experience: newExperience,
          gold: newGold
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // If there's an item reward, add it to inventory
      if (quest.quest.item_reward_id) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert({
            profile_id: profile.id,
            item_id: quest.quest.item_reward_id,
            quantity: 1
          })

        if (inventoryError) throw inventoryError
      }

      // Notify parent of profile update
      if (onProfileUpdate) {
        onProfileUpdate({
          experience: newExperience,
          gold: newGold
        })
      }

      // Log the completion
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'complete_quest',
          description: `Completed quest: ${quest.quest.title} (+${quest.quest.experience_reward} XP, +${quest.quest.gold_reward} Gold)`
        })
    } catch (error) {
      console.error('Complete quest error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Active Quests</h2>
      {quests.length > 0 ? (
        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{quest.quest?.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${getDifficultyColor(quest.quest?.difficulty || 'easy')}`}>
                      {quest.quest?.difficulty.charAt(0).toUpperCase() + quest.quest?.difficulty.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Level {quest.quest?.level_requirement}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {quest.quest?.description}
                  </p>
                </div>
                <span className="text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {quest.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {quest.progress}%</span>
                  {quest.is_working && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400 animate-pulse">
                        Working...
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({calculateProgressRate(quest)}% per {PROGRESS_INTERVAL / 1000}s)
                      </span>
                      {quest.progress < 100 && (
                        <span className="text-gray-600 dark:text-gray-400">
                          ~{getEstimatedTimeRemaining(quest)} remaining
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.quest?.difficulty === 'epic' ? 'bg-orange-600' :
                      quest.quest?.difficulty === 'hard' ? 'bg-purple-600' :
                      quest.quest?.difficulty === 'medium' ? 'bg-blue-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${quest.progress}%` }}
                  />
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p>Rewards:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{quest.quest?.experience_reward} XP</li>
                  <li>{quest.quest?.gold_reward} Gold</li>
                  {quest.quest?.item_reward && (
                    <li>{quest.quest.item_reward.name}</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2">
                {quest.progress < 100 && (
                  <button
                    onClick={() => toggleQuestWork(quest.id)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      quest.is_working
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {quest.is_working ? 'Stop Working' : 'Work on Quest'}
                  </button>
                )}
                {quest.progress === 100 && (
                  <button
                    onClick={() => handleCompleteQuest(quest)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Completing...' : 'Complete Quest'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No active quests. Check the quest board for available quests!
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

export default ActiveQuests 