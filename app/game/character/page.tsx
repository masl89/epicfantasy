import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CharacterStats from './CharacterStats'
import CharacterEquipment from './CharacterEquipment'
import type { Profile } from '@/types/database'

const CharacterPage = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single()

  const { data: equippedItems } = await supabase
    .from('inventory')
    .select(`
      *,
      item:items(*)
    `)
    .eq('profile_id', profile?.id)
    .eq('is_equipped', true)

  const { data: inventoryItems } = await supabase
    .from('inventory')
    .select(`
      *,
      item:items(*)
    `)
    .eq('profile_id', profile?.id)

  if (!profile) {
    return <div>Error loading character</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Character Sheet</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CharacterStats profile={profile as Profile} />
          <CharacterEquipment 
            profile={profile as Profile} 
            equippedItems={equippedItems || []}
            inventoryItems={inventoryItems || []}
          />
        </div>
      </div>
    </div>
  )
}

export default CharacterPage 