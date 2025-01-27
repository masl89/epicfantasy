<think>
Okay, I need to create comprehensive documentation for the provided game code. Let me start by understanding the structure and components of the game based on the code files provided.

First, I'll look at the main features mentioned. The game has authentication, character management, dungeons, quests, inventory, and a dashboard. Each of these features is implemented in different parts of the code, like the auth routes, character pages, dungeon components, etc.

Next, I'll outline the technology stack. The project uses Next.js with TypeScript, Supabase for the backend, Tailwind CSS for styling, and various other libraries like React and NextAuth.js. The package.json would have these dependencies, so I should check that to confirm versions and any additional packages.

Looking at the key components, the character system includes stats, equipment, and classes. The equipment system allows players to equip items in different slots, affecting their stats. The dungeon system involves battles with monsters, real-time updates, and progression tracking. Quests have different difficulties, rewards, and real-time progress tracking. The inventory system lets players manage items, equip them, and sell for gold.

I need to explain the database schema based on the types used in the code. The Profile type includes user stats, and InventoryItem links to items. The database likely has tables for profiles, items, inventory, quests, dungeons, battles, and activity logs. Supabase relationships are important here, like foreign keys connecting inventory to items.

Key mechanics include stat calculation, experience leveling, battle mechanics with turn-based combat, and quest progression. The code has functions for calculating player power, experience levels, and damage in battles.

For the API and services, Supabase is used extensively. The middleware probably handles authentication and redirects, which is mentioned in the auth callback route. The activity log tracks player actions, which is used in various components like equipping items or completing quests.

Development setup would involve environment variables for Supabase, installation steps, and available scripts from package.json. I should note the required environment variables and any setup commands.

Areas for extension could include adding new item types, quest types, dungeon features, or multiplayer elements. The documentation should guide future development by explaining where to modify code for these features.

I'll make sure the documentation is structured clearly, with sections for overview, features, tech stack, components, database schema, mechanics, API usage, setup, and extensions. This will help anyone working on the codebase understand the existing structure and how to build upon it.
</think>

Here's comprehensive documentation for the fantasy RPG game based on the provided code:

# Epic Fantasy RPG Documentation

## Overview
A browser-based fantasy RPG with these core features:
- Character creation (Warrior/Mage/Rogue) with stats progression
- Equipment system with gear slots and stat bonuses
- Turn-based dungeon battles with monsters
- Quest system with progression tracking
- Inventory management
- Player profile with stats/leveling
- Authentication system (Email/Password via Supabase)

## Technology Stack
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **State Management**: React Context + Local State
- **Real-time**: Supabase Realtime
- **Other Libraries**:
  - React Hook Form
  - Zod (validation)
  - React Icons
  - date-fns (date formatting)

## Key Game Systems

### 1. Character System
**Components**:
- `CharacterCreation`: Class selection with base stats
- `CharacterStats`: Displays/edits character attributes
- `CharacterEquipment`: Gear management with slot system

**Stats**:
- Strength (physical damage)
- Intelligence (magic damage)
- Dexterity (critical chance)
- Health
- Experience/Leveling

**Classes**:
| Class     | Strength | Intelligence | Dexterity |
|----------|----------|--------------|-----------|
| Warrior  | 15       | 8            | 10        |
| Mage     | 6        | 15           | 8         |
| Rogue    | 8        | 10           | 15        |

### 2. Equipment System
**Gear Slots**:
- Head, Chest, Legs, Feet
- Weapon, Off-hand
- Ring, Necklace

**Item Bonuses**:
- Health
- Strength
- Intelligence 
- Dexterity

**Mechanics**:
- Equipment popups show available items
- Automatic stat bonus calculation
- Level requirements for equipment
- Real-time updates via Supabase

### 3. Dungeon System
**Components**:
- `DungeonList`: Available dungeons
- `ActiveBattle`: Turn-based combat UI
- `DungeonDetails`: Dungeon entry requirements

**Battle Mechanics**:
- Turn interval: 2 seconds
- Damage calculation based on:
  ```damage = attacker_power - defender_defense```
- Real-time battle updates
- Loot system with chance calculations
- Progressive dungeon levels (1-10)

### 4. Quest System
**Components**:
- `QuestBoard`: Available quests
- `ActiveQuests`: Current player quests

**Features**:
- Difficulty levels (Easy/Medium/Hard/Epic)
- Progress tracking with time estimates
- Auto-progression system
- Reward scaling by difficulty
- Item reward chances

### 5. Inventory System
**Features**:
- Categorized items (by type)
- Equipment highlighting
- Item tooltips with stats
- Sell functionality (50% value)
- Bulk item management

## Database Schema (Supabase)
Key Tables:

1. `profiles`
```typescript
{
  id: UUID
  username: string
  character_class: 'warrior' | 'mage' | 'rogue'
  level: number
  experience: number
  gold: number
  strength: number
  intelligence: number
  dexterity: number
  health: number
  max_health: number
}
```

2. `inventory`
```typescript
{
  id: UUID
  profile_id: UUID (references profiles)
  item_id: UUID (references items)
  quantity: number
  is_equipped: boolean
}
```

3. `items`
```typescript
{
  id: UUID
  name: string
  type: 'weapon' | 'armor' | 'consumable'
  equipment_slot: EquipmentSlot
  health_bonus: number
  strength_bonus: number
  intelligence_bonus: number
  dexterity_bonus: number
  price: number
  level_requirement: number
}
```

4. `battles`
```typescript
{
  id: UUID
  profile_id: UUID
  dungeon_id: UUID
  status: 'in_progress' | 'victory' | 'defeat'
  player_health: number
  monster_health: number
  turns: BattleTurn[]
  rewards: LootReward
}
```

## Key Game Mechanics

### 1. Leveling System
Experience formula:
```typescript
function calculateLevel(totalExp: number) {
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
```

### 2. Battle System
Turn sequence:
1. Player damage calculation
2. Monster damage calculation
3. Health updates
4. Check victory/defeat conditions
5. Award rewards (gold, exp, items)

### 3. Quest Progression
Difficulty multipliers:
```typescript
const DIFFICULTY_MULTIPLIERS = {
  easy: { experience: 1, gold: 1, itemChance: 0 },
  medium: { experience: 1.5, gold: 1.2, itemChance: 0.1 },
  hard: { experience: 2, gold: 1.5, itemChance: 0.2 },
  epic: { experience: 3, gold: 2, itemChance: 0.3 }
};
```

## Development Setup

1. Environment Variables (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

2. Installation:
```bash
npm install
npm run dev
```

3. Available Scripts:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Areas for Extension

1. **New Item Types**:
   - Consumables (potions/scrolls)
   - Crafting materials
   - Set items with bonuses

2. **Additional Systems**:
   - Player vs Player (PvP) battles
   - Guild/Clan system
   - Achievement system

3. **Enhanced Dungeons**:
   - Boss battles
   - Trap mechanics
   - Puzzle rooms

4. **UI Improvements**:
   - 3D character preview
   - Battle animations
   - Interactive world map

This documentation provides a foundation for understanding the game's architecture. For specific implementation details, refer to the component files and Supabase table definitions.
