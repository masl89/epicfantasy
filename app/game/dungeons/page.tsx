import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DungeonProvider } from './DungeonContext'
import DungeonContent from './DungeonContent'
import type { Profile } from '@/types/database'

const DungeonsPage = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  // First get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .single()

  if (!profile || profileError) {
    return <div>Error loading profile</div>
  }
  // Get any active battle for this profile, including the associated monster details
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      monster:monsters(*)
    `)
    .eq('profile_id', profile.id)
    .eq('status', 'in_progress')
    .single()

  return (
    <DungeonProvider 
      initialProfile={profile} 
      initialBattle={battle}
    >
      <DungeonContent />
    </DungeonProvider>
  )
}

export default DungeonsPage 