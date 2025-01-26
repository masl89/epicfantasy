"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile, InventoryItem, EquipmentSlot } from '@/types/database'
import EquipmentSlotPopup from './EquipmentSlotPopup'
import Tooltip from '@/components/ui/Tooltip'

interface CharacterEquipmentProps {
  profile: Profile
  equippedItems: InventoryItem[]
  inventoryItems: InventoryItem[]
}

const equipmentSlots: { slot: EquipmentSlot; label: string }[] = [
  { slot: 'head', label: 'Head' },
  { slot: 'chest', label: 'Chest' },
  { slot: 'legs', label: 'Legs' },
  { slot: 'feet', label: 'Feet' },
  { slot: 'weapon', label: 'Weapon' },
  { slot: 'offhand', label: 'Off-hand' },
  { slot: 'ring', label: 'Ring' },
  { slot: 'necklace', label: 'Necklace' }
]

const CharacterEquipment = ({ profile, equippedItems, inventoryItems }: CharacterEquipmentProps) => {
  const supabase = createClientComponentClient()
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null)

  const getEquippedItem = (slot: EquipmentSlot) => {
    return equippedItems.find(item => item.item?.equipment_slot === slot)
  }

  const calculateBonusStats = () => {
    return equippedItems.reduce((stats, equippedItem) => {
      const item = equippedItem.item
      if (!item) return stats

      return {
        health: stats.health + (item.health_bonus || 0),
        strength: stats.strength + (item.strength_bonus || 0),
        intelligence: stats.intelligence + (item.intelligence_bonus || 0),
        dexterity: stats.dexterity + (item.dexterity_bonus || 0)
      }
    }, {
      health: 0,
      strength: 0,
      intelligence: 0,
      dexterity: 0
    })
  }

  const bonusStats = calculateBonusStats()

  const getAvailableItems = (slot: EquipmentSlot) => {
    return inventoryItems.filter(item => 
      item.item?.equipment_slot === slot && 
      !item.is_equipped &&
      item.item.level_requirement <= profile.level
    )
  }

  const handleEquip = async (itemId: string) => {
    try {
      setError(null)
      
      // First, unequip any item in the same slot
      const itemToEquip = inventoryItems.find(item => item.id === itemId)
      const slot = itemToEquip?.item?.equipment_slot
      const currentlyEquipped = equippedItems.find(item => 
        item.item?.equipment_slot === slot
      )

      if (currentlyEquipped) {
        await supabase
          .from('inventory')
          .update({ is_equipped: false })
          .eq('id', currentlyEquipped.id)
      }

      // Then equip the new item
      const { error: equipError } = await supabase
        .from('inventory')
        .update({ is_equipped: true })
        .eq('id', itemId)

      if (equipError) throw equipError

      // Log the equipment change
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'equip_item',
          description: `Equipped ${itemToEquip?.item?.name}`
        })

      window.location.reload() // Refresh to update stats
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleUnequip = async (itemId: string) => {
    try {
      setError(null)
      
      const { error: unequipError } = await supabase
        .from('inventory')
        .update({ is_equipped: false })
        .eq('id', itemId)

      if (unequipError) throw unequipError

      const itemUnequipped = equippedItems.find(item => item.id === itemId)

      // Log the equipment change
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'unequip_item',
          description: `Unequipped ${itemUnequipped?.item?.name}`
        })

      window.location.reload() // Refresh to update stats
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Equipment</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {equipmentSlots.map(({ slot, label }) => {
          const equippedItem = getEquippedItem(slot)
          
          return (
            <div 
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
              role="button"
              tabIndex={0}
              aria-label={`${label} equipment slot`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {label}
              </p>
              {equippedItem?.item ? (
                <Tooltip item={equippedItem.item}>
                  <div>
                    <p className="font-medium">{equippedItem.item.name}</p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                      {equippedItem.item.health_bonus ? (
                        <p>+{equippedItem.item.health_bonus} Health</p>
                      ) : null}
                      {equippedItem.item.strength_bonus ? (
                        <p>+{equippedItem.item.strength_bonus} Strength</p>
                      ) : null}
                      {equippedItem.item.intelligence_bonus ? (
                        <p>+{equippedItem.item.intelligence_bonus} Intelligence</p>
                      ) : null}
                      {equippedItem.item.dexterity_bonus ? (
                        <p>+{equippedItem.item.dexterity_bonus} Dexterity</p>
                      ) : null}
                    </div>
                  </div>
                </Tooltip>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Empty slot
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Total Bonus Stats */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Equipment Bonuses</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Health</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">
              +{bonusStats.health}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Strength</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">
              +{bonusStats.strength}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Intelligence</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">
              +{bonusStats.intelligence}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dexterity</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">
              +{bonusStats.dexterity}
            </p>
          </div>
        </div>
      </div>

      {selectedSlot && (
        <EquipmentSlotPopup
          slot={selectedSlot}
          equippedItem={getEquippedItem(selectedSlot)}
          availableItems={getAvailableItems(selectedSlot)}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

export default CharacterEquipment 