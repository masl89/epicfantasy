"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Tooltip from '@/components/ui/Tooltip'
import ItemActions from './ItemActions'
import type { Profile, InventoryItem } from '@/types/database'

interface InventoryGridProps {
  profile: Profile
  inventoryItems: InventoryItem[]
}

const InventoryGrid = ({ profile, inventoryItems }: InventoryGridProps) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const groupedItems = inventoryItems.reduce((acc, item) => {
    const key = item.item?.type || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([type, items]) => (
        <div key={type} className="space-y-4">
          <h2 className="text-lg font-semibold capitalize">
            {type}s
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer
                  ${item.is_equipped 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
                  hover:border-blue-300 transition-colors
                `}
                onClick={() => setSelectedItem(item)}
                role="button"
                tabIndex={0}
              >
                {item.item && (
                  <Tooltip item={item.item}>
                    <div>
                      <p className="font-medium">{item.item.name}</p>
                      {item.quantity > 1 && (
                        <span className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                          {item.quantity}
                        </span>
                      )}
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {item.item.health_bonus > 0 && (
                          <p>+{item.item.health_bonus} Health</p>
                        )}
                        {item.item.strength_bonus > 0 && (
                          <p>+{item.item.strength_bonus} Strength</p>
                        )}
                        {item.item.intelligence_bonus > 0 && (
                          <p>+{item.item.intelligence_bonus} Intelligence</p>
                        )}
                        {item.item.dexterity_bonus > 0 && (
                          <p>+{item.item.dexterity_bonus} Dexterity</p>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedItem && (
        <ItemActions
          item={selectedItem}
          profile={profile}
          onClose={() => setSelectedItem(null)}
          onError={setError}
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

export default InventoryGrid 