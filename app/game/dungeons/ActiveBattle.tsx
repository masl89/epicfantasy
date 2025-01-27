"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/types/database'
import type { Battle, BattleTurn } from '@/types/dungeon'
import { calculatePlayerPower, calculateMonsterPower, calculateDamage, calculateLootChance } from '@/lib/battle'
import { useDungeon } from './DungeonContext'

interface ActiveBattleProps {
  battle: Battle
  profile: Profile
}

const TURN_INTERVAL = 2000 // 2 seconds per turn

const ActiveBattle = ({ battle, profile }: ActiveBattleProps) => {
  const supabase = createClientComponentClient()
  const [currentBattle, setCurrentBattle] = useState(battle)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshData } = useDungeon()

  const playerPower = calculatePlayerPower(profile)
  const monsterPower = battle.monster ? calculateMonsterPower(battle.monster) : 0

  useEffect(() => {
    if (currentBattle.status !== 'in_progress') return

    const interval = setInterval(async () => {
      try {
        // Calculate damage for this turn
        const playerDamage = calculateDamage(playerPower, battle.monster?.defense || 0)
        const monsterDamage = calculateDamage(monsterPower, profile.defense || 0)

        // Calculate new health values
        const newMonsterHealth = Math.max(0, currentBattle.monster_health - playerDamage)
        const newPlayerHealth = Math.max(0, currentBattle.player_health - monsterDamage)

        // Create turn data
        const newTurn: BattleTurn = {
          turn: (currentBattle.turns || []).length + 1,
          player_damage: playerDamage,
          monster_damage: monsterDamage,
          player_health: newPlayerHealth,
          monster_health: newMonsterHealth
        }

        // Check if battle is over
        const newStatus = newMonsterHealth === 0 ? 'victory' : 
                         newPlayerHealth === 0 ? 'defeat' : 
                         'in_progress'

        let rewards = null
        if (newStatus === 'victory' && battle.monster) {
          rewards = calculateLootChance(battle.monster, profile.level)
        }

        // Update battle in database
        const { data: updatedBattle, error: updateError } = await supabase
          .from('battles')
          .update({
            player_health: newPlayerHealth,
            monster_health: newMonsterHealth,
            status: newStatus,
            turns: [...(currentBattle.turns || []), newTurn],
            rewards: rewards,
            completed_at: newStatus !== 'in_progress' ? new Date().toISOString() : null
          })
          .eq('id', battle.id)
          .select()
          .single()

        if (updateError) throw updateError

        setCurrentBattle(updatedBattle)

        // Handle battle completion
        if (newStatus !== 'in_progress') {
          await handleBattleComplete(newStatus, rewards)
        }
      } catch (error) {
        console.error('Battle turn error:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      }
    }, TURN_INTERVAL)

    return () => clearInterval(interval)
  }, [currentBattle, battle.monster, profile, playerPower, monsterPower])

  const handleBattleComplete = async (status: 'victory' | 'defeat', rewards: any) => {
    try {
      setLoading(true)

      if (status === 'victory') {
        // Update profile with rewards
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            experience: profile.experience + rewards.experience,
            gold: profile.gold + rewards.gold
          })
          .eq('id', profile.id)

        if (profileError) throw profileError

        // Add items to inventory if any
        if (rewards.items?.length) {
          const { error: inventoryError } = await supabase
            .from('inventory')
            .insert(rewards.items.map((item: any) => ({
              profile_id: profile.id,
              item_id: item.id,
              quantity: 1
            })))

          if (inventoryError) throw inventoryError
        }

        // Update dungeon progress
        const { error: progressError } = await supabase
          .from('dungeon_progress')
          .update({
            current_level: battle.dungeon_level + 1,
            highest_level: Math.max(battle.dungeon_level + 1, currentBattle.dungeon_level),
            completed: battle.dungeon_level === 10 // Assuming 10 is max level
          })
          .eq('profile_id', profile.id)
          .eq('dungeon_id', battle.dungeon_id)

        if (progressError) throw progressError

        // Log the victory
        await supabase
          .from('activity_log')
          .insert({
            profile_id: profile.id,
            activity_type: 'battle_victory',
            description: `Defeated monster in dungeon level ${battle.dungeon_level} (+${rewards.experience} XP, +${rewards.gold} Gold)`
          })
      } else {
        // Log the defeat
        await supabase
          .from('activity_log')
          .insert({
            profile_id: profile.id,
            activity_type: 'battle_defeat',
            description: `Was defeated in dungeon level ${battle.dungeon_level}`
          })
      }

      await refreshData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Player Stats */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Player</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>{currentBattle.player_health}/{profile.max_health}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(currentBattle.player_health / profile.max_health) * 100}%` 
                  }}
                />
              </div>
            </div>
            <p className="text-sm">Power: {playerPower}</p>
          </div>
        </div>

        {/* Monster Stats */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">
            {battle.monster?.name || 'Monster'}
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>
                  {currentBattle.monster_health}/{battle.monster?.health}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(currentBattle.monster_health / (battle.monster?.health || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
            <p className="text-sm">Power: {monsterPower}</p>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
        <h3 className="font-semibold mb-2">Battle Log</h3>
        <div className="space-y-2">
          {currentBattle.turns?.map((turn, index) => (
            <div key={index} className="text-sm">
              <p>
                Turn {turn.turn}:{' '}
                <span className="text-blue-600">
                  You deal {turn.player_damage} damage
                </span>
                {' • '}
                <span className="text-red-600">
                  Monster deals {turn.monster_damage} damage
                </span>
              </p>
            </div>
          ))}
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

export default ActiveBattle 