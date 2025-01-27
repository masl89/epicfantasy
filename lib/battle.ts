import type { Profile } from '@/types/database';
import type { Monster } from '@/types/dungeon';

export const calculatePlayerPower = (profile: Profile) => {
  // Base power from stats
  const basePower = profile.strength + profile.intelligence + profile.dexterity;
  
  // Level bonus
  const levelBonus = profile.level * 5;
  
  // Equipment bonus (if you have equipment system)
  const equipmentBonus = 0; // Calculate from equipped items
  
  return basePower + levelBonus + equipmentBonus;
};

export const calculateMonsterPower = (monster: Monster) => {
  return monster.damage + monster.defense + (monster.level * 3);
};

export const calculateDamage = (attacker: number, defender: number) => {
  const baseDamage = Math.max(1, attacker - (defender * 0.5));
  const variance = baseDamage * 0.2; // 20% variance
  return Math.floor(baseDamage + (Math.random() * variance * 2 - variance));
};

export const calculateLootChance = (
  monster: Monster,
  playerLevel: number
): { items: string[], experience: number, gold: number } => {
  const items: string[] = [];
  const levelDifference = playerLevel - monster.level;
  
  // Base rewards
  let experienceMultiplier = 1;
  let goldMultiplier = 1;

  // Adjust rewards based on level difference
  if (levelDifference > 5) {
    experienceMultiplier = 0.5;
    goldMultiplier = 0.5;
  } else if (levelDifference < -5) {
    experienceMultiplier = 1.5;
    goldMultiplier = 1.5;
  }

  // Roll for each possible item
  monster.loot_table.forEach(({ item_id, chance }) => {
    if (Math.random() < chance) {
      items.push(item_id);
    }
  });

  return {
    items,
    experience: Math.floor(monster.experience_reward * experienceMultiplier),
    gold: Math.floor(monster.gold_reward * goldMultiplier)
  };
}; 