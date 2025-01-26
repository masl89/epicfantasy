import type { QuestDifficulty } from '@/types/database'

// Base reward multipliers per difficulty
export const DIFFICULTY_MULTIPLIERS: Record<QuestDifficulty, {
  experience: number
  gold: number
  itemChance: number
}> = {
  easy: {
    experience: 1,
    gold: 1,
    itemChance: 0.1 // 10% chance for bonus item
  },
  medium: {
    experience: 1.5,
    gold: 1.5,
    itemChance: 0.25 // 25% chance for bonus item
  },
  hard: {
    experience: 2.5,
    gold: 2,
    itemChance: 0.5 // 50% chance for bonus item
  },
  epic: {
    experience: 4,
    gold: 3,
    itemChance: 1 // 100% chance for bonus item
  }
}

// Calculate rewards based on difficulty and base values
export const calculateQuestRewards = (
  difficulty: QuestDifficulty,
  baseExperience: number,
  baseGold: number
) => {
  const multipliers = DIFFICULTY_MULTIPLIERS[difficulty]
  return {
    experience: Math.round(baseExperience * multipliers.experience),
    gold: Math.round(baseGold * multipliers.gold)
  }
}

// Get color scheme for difficulty
export const getDifficultyStyles = (difficulty: QuestDifficulty) => {
  switch (difficulty) {
    case 'epic':
      return {
        text: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        progress: 'bg-orange-600'
      }
    case 'hard':
      return {
        text: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        progress: 'bg-purple-600'
      }
    case 'medium':
      return {
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        progress: 'bg-blue-600'
      }
    default:
      return {
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        progress: 'bg-green-600'
      }
  }
} 