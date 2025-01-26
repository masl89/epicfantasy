"use client"

import { useState, useRef, useEffect } from 'react'
import type { Item } from '@/types/database'

interface TooltipProps {
  item: Item
  children: React.ReactNode
}

const Tooltip = ({ item, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current || !tooltipRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let top = containerRect.bottom + 8
      let left = containerRect.left + (containerRect.width - tooltipRect.width) / 2

      // Adjust horizontal position if tooltip would overflow viewport
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8
      }
      if (left < 8) left = 8

      // If tooltip would overflow bottom of viewport, show it above the element
      if (top + tooltipRect.height > viewportHeight) {
        top = containerRect.top - tooltipRect.height - 8
      }

      setPosition({ top, left })
    }

    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible])

  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-500'
      case 'uncommon': return 'text-green-500'
      case 'rare': return 'text-blue-500'
      case 'epic': return 'text-purple-500'
      case 'legendary': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="relative inline-block"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-64 p-4 bg-gray-900 text-white rounded-lg shadow-xl"
          style={{ top: position.top, left: position.left }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={`font-bold ${getRarityColor(item.rarity)}`}>
                {item.name}
              </h4>
              <span className="text-xs text-gray-400">
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-300 italic border-b border-gray-700 pb-2">
                {item.description}
              </p>
            )}

            <div className="space-y-1 text-sm">
              {item.level_requirement > 1 && (
                <p className="text-red-400">
                  Requires Level {item.level_requirement}
                </p>
              )}
              {item.equipment_slot && (
                <p className="text-gray-400">
                  {item.equipment_slot.charAt(0).toUpperCase() + item.equipment_slot.slice(1)}
                </p>
              )}
              {item.health_bonus > 0 && (
                <p className="text-green-400">+{item.health_bonus} Health</p>
              )}
              {item.strength_bonus > 0 && (
                <p className="text-green-400">+{item.strength_bonus} Strength</p>
              )}
              {item.intelligence_bonus > 0 && (
                <p className="text-green-400">+{item.intelligence_bonus} Intelligence</p>
              )}
              {item.dexterity_bonus > 0 && (
                <p className="text-green-400">+{item.dexterity_bonus} Dexterity</p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-right text-sm text-gray-400">
                Value: {item.price} gold
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tooltip 