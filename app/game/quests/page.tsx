import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import QuestsClient from './QuestsClient'
import type { Profile } from '@/types/database'

const QuestsPage = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .single()

  if (profileError) {
    console.error('Profile error:', profileError)
    return <div>Error loading profile</div>
  }

  const { data: activeQuests, error: activeQuestsError } = await supabase
    .from('player_quests')
    .select(`
      *,
      quest:quests(
        *,
        item_reward:items(*)
      )
    `)
    .eq('profile_id', profile.id)
    .not('status', 'eq', 'completed')
    .order('started_at', { ascending: false })

  if (activeQuestsError) {
    console.error('Active quests error:', activeQuestsError)
  }

  const { data: availableQuests, error: availableQuestsError } = await supabase
    .from('quests')
    .select(`
      id,
      title,
      description,
      level_requirement,
      experience_reward,
      gold_reward,
      difficulty,
      item_reward:items(*)
    `)
    .lte('level_requirement', profile.level)
    .order('level_requirement', { ascending: true })

  if (availableQuestsError) {
    console.error('Available quests error:', availableQuestsError)
  }

  // Filter out active quests
  const activeQuestIds = (activeQuests || []).map(q => q.quest_id).filter(Boolean)
  const filteredAvailableQuests = (availableQuests || []).filter(
    quest => !activeQuestIds.includes(quest.id)
  )

  return (
    <QuestsClient 
      initialProfile={profile}
      activeQuests={activeQuests || []}
      availableQuests={filteredAvailableQuests}
    />
  )
}

export default QuestsPage 