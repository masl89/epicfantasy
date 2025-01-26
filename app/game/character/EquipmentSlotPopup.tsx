"use client"

import { useState } from 'react'
import type { InventoryItem, EquipmentSlot } from '@/types/database'
import Tooltip from '@/components/ui/Tooltip'

interface EquipmentSlotPopupProps {
  slot: EquipmentSlot
  equippedItem: InventoryItem | undefined
  availableItems: InventoryItem[]
  onEquip: (itemId: string) => Promise<void>
  onUnequip: (itemId: string) => Promise<void>
  isOpen: boolean
  onClose: () => void
}

const EquipmentSlotPopup = ({
  slot,
  equippedItem,
  availableItems,
  onEquip,
  onUnequip,
  isOpen,
  onClose
}: EquipmentSlotPopupProps) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleEquip = async (itemId: string) => {
    setLoading(true)
    await onEquip(itemId)
    setLoading(false)
    onClose()
  }

  const handleUnequip = async (itemId: string) => {
    setLoading(true)
    await onUnequip(itemId)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{slot} Equipment</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close popup"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {equippedItem?.item && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h4 className="font-medium mb-2">Currently Equipped</h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <Tooltip item={equippedItem.item}>
                    <div>
                      <p className="font-medium">{equippedItem.item.name}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {equippedItem.item?.health_bonus ? (
                          <p>+{equippedItem.item.health_bonus} Health</p>
                        ) : null}
                        {equippedItem.item?.strength_bonus ? (
                          <p>+{equippedItem.item.strength_bonus} Strength</p>
                        ) : null}
                        {equippedItem.item?.intelligence_bonus ? (
                          <p>+{equippedItem.item.intelligence_bonus} Intelligence</p>
                        ) : null}
                        {equippedItem.item?.dexterity_bonus ? (
                          <p>+{equippedItem.item.dexterity_bonus} Dexterity</p>
                        ) : null}
                      </div>
                    </div>
                  </Tooltip>
                  <button
                    onClick={() => handleUnequip(equippedItem.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Unequip
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Available Items</h4>
            {availableItems.length > 0 ? (
              <div className="space-y-2">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      {item.item && (
                        <Tooltip item={item.item}>
                          <div>
                            <p className="font-medium">{item.item.name}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.item?.health_bonus ? (
                                <p>+{item.item.health_bonus} Health</p>
                              ) : null}
                              {item.item?.strength_bonus ? (
                                <p>+{item.item.strength_bonus} Strength</p>
                              ) : null}
                              {item.item?.intelligence_bonus ? (
                                <p>+{item.item.intelligence_bonus} Intelligence</p>
                              ) : null}
                              {item.item?.dexterity_bonus ? (
                                <p>+{item.item.dexterity_bonus} Dexterity</p>
                              ) : null}
                            </div>
                          </div>
                        </Tooltip>
                      )}
                      <button
                        onClick={() => handleEquip(item.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Equip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No available items for this slot
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentSlotPopup 