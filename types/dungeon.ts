export interface Monster {
  id: string;
  name: string;
  level: number;
  health: number;
  damage: number;
  defense: number;
  experience_reward: number;
  gold_reward: number;
  is_boss: boolean;
  loot_table: {
    item_id: string;
    chance: number;
  }[];
  created_at: string;
}

export interface Dungeon {
  id: string;
  name: string;
  description: string | null;
  min_level: number;
  max_level: number;
  levels: number;
  created_at: string;
}

export interface DungeonLevel {
  id: string;
  dungeon_id: string;
  level_number: number;
  monster_id: string;
  is_boss_level: boolean;
  created_at: string;
  monster?: Monster;
}

export interface DungeonProgress {
  id: string;
  profile_id: string;
  dungeon_id: string;
  current_level: number;
  highest_level: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Battle {
  id: string;
  profile_id: string;
  dungeon_id: string;
  dungeon_level: number;
  monster_id: string;
  player_health: number;
  monster_health: number;
  status: 'in_progress' | 'victory' | 'defeat';
  turns: BattleTurn[];
  rewards: BattleRewards | null;
  created_at: string;
  completed_at: string | null;
  monster?: Monster;
}

export interface BattleTurn {
  turn: number;
  player_damage: number;
  monster_damage: number;
  player_health: number;
  monster_health: number;
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items?: {
    id: string;
    name: string;
  }[];
} 