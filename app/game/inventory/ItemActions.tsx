"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Profile, InventoryItem } from '@/types/database'

interface ItemActionsProps {
  item: InventoryItem
  profile: Profile
  onClose: () => void
  onError: (error: string | null) => void
}

const ItemActions = ({ item, profile, onClose, onError }: ItemActionsProps) => {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)

  const handleEquipToggle = async () => {
    try {
      setLoading(true)
      onError(null)

      if (item.is_equipped) {
        // Unequip item
        const { error: unequipError } = await supabase
          .from('inventory')
          .update({ is_equipped: false })
          .eq('id', item.id)

        if (unequipError) throw unequipError

        await supabase
          .from('activity_log')
          .insert({
            profile_id: profile.id,
            activity_type: 'unequip_item',
            description: `Unequipped ${item.item?.name}`
          })
      } else {
        // First, unequip any item in the same slot
        if (item.item?.equipment_slot) {
          const { error: unequipError } = await supabase
            .from('inventory')
            .update({ is_equipped: false })
            .eq('profile_id', profile.id)
            .eq('is_equipped', true)
            .like('item.equipment_slot', item.item.equipment_slot)

          if (unequipError) throw unequipError
        }

        // Then equip the new item
        const { error: equipError } = await supabase
          .from('inventory')
          .update({ is_equipped: true })
          .eq('id', item.id)

        if (equipError) throw equipError

        await supabase
          .from('activity_log')
          .insert({
            profile_id: profile.id,
            activity_type: 'equip_item',
            description: `Equipped ${item.item?.name}`
          })
      }

      window.location.reload() // Refresh to update stats
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSell = async () => {
    try {
      setLoading(true)
      onError(null)

      if (!item.item?.price) throw new Error('Item has no value')

      // Calculate sell value (50% of buy price)
      const sellValue = Math.floor(item.item.price * 0.5)

      // Update gold
      const { error: updateGoldError } = await supabase
        .from('profiles')
        .update({ gold: profile.gold + sellValue })
        .eq('id', profile.id)

      if (updateGoldError) throw updateGoldError

      // Remove item from inventory
      const { error: removeItemError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', item.id)

      if (removeItemError) throw removeItemError

      // Log the transaction
      await supabase
        .from('activity_log')
        .insert({
          profile_id: profile.id,
          activity_type: 'sell_item',
          description: `Sold ${item.item.name} for ${sellValue} gold`
        })

      window.location.reload() // Refresh to update inventory
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Item Actions</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {item.item?.equipment_slot && (
            <button
              onClick={handleEquipToggle}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : item.is_equipped ? 'Unequip' : 'Equip'}
            </button>
          )}

          <button
            onClick={handleSell}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Sell for ${Math.floor((item.item?.price || 0) * 0.5)} gold`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemActions 