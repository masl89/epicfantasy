import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import InventoryGrid from './InventoryGrid'
import type { Profile } from '@/types/database'

const InventoryPage = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single()

  const { data: inventoryItems } = await supabase
    .from('inventory')
    .select(`
      *,
      item:items(*)
    `)
    .eq('profile_id', profile?.id)
    .order('created_at', { ascending: false })

  if (!profile) {
    return <div>Error loading inventory</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Gold: {profile.gold}
          </div>
        </div>
        <InventoryGrid 
          profile={profile as Profile} 
          inventoryItems={inventoryItems || []}
        />
      </div>
    </div>
  )
}

export default InventoryPage 