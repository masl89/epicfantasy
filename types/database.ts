export type CharacterClass = 'warrior' | 'mage' | 'rogue'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable'
export type EquipmentSlot = 'head' | 'chest' | 'legs' | 'feet' | 'weapon' | 'offhand' | 'ring' | 'necklace'
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed'
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic'

export interface Profile {
  id: string
  username: string
  character_class: CharacterClass
  level: number
  experience: number
  gold: number
  health: number
  max_health: number
  strength: number
  intelligence: number
  dexterity: number
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  type: ItemType
  rarity: ItemRarity
  level_requirement: number
  equipment_slot: EquipmentSlot | null
  health_bonus: number
  strength_bonus: number
  intelligence_bonus: number
  dexterity_bonus: number
  price: number
  created_at: string
}

export interface InventoryItem {
  id: string
  profile_id: string
  item_id: string
  quantity: number
  is_equipped: boolean
  created_at: string
  item?: Item
}

export interface Quest {
  id: string
  title: string
  description: string
  level_requirement: number
  experience_reward: number
  gold_reward: number
  item_reward_id: string | null
  created_at: string
  item_reward?: Item
  difficulty: QuestDifficulty
  base_progress_rate: number
}

export interface PlayerQuest {
  id: string
  profile_id: string
  quest_id: string
  status: QuestStatus
  progress: number
  started_at: string
  completed_at: string | null
  quest?: Quest
}

export interface ActivityLog {
  id: string
  profile_id: string
  activity_type: string
  description: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      items: {
        Row: Item
        Insert: Omit<Item, 'id' | 'created_at'>
        Update: Partial<Omit<Item, 'id' | 'created_at'>>
      }
      inventory: {
        Row: InventoryItem
        Insert: Omit<InventoryItem, 'id' | 'created_at'>
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at'>>
      }
      quests: {
        Row: Quest
        Insert: Omit<Quest, 'id' | 'created_at'>
        Update: Partial<Omit<Quest, 'id' | 'created_at'>>
      }
      player_quests: {
        Row: PlayerQuest
        Insert: Omit<PlayerQuest, 'id' | 'started_at'>
        Update: Partial<Omit<PlayerQuest, 'id' | 'started_at'>>
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>
      }
    }
  }
} 