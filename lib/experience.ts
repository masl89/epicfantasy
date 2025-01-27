export interface LevelInfo {
  level: number;
  currentLevelExp: number;
  expForNextLevel: number;
}

export const calculateLevel = (totalExp: number): LevelInfo => {
  // Each level requires level * 100 exp
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1;
  let remainingExp = totalExp;
  
  while (remainingExp >= level * 100) {
    remainingExp -= level * 100;
    level++;
  }
  
  return {
    level,
    currentLevelExp: remainingExp,
    expForNextLevel: level * 100
  };
} 