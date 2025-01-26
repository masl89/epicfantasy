'use client'

import { useState } from 'react'
import QuestBoard from './QuestBoard'
import ActiveQuests from './ActiveQuests'
import type { Profile, PlayerQuest, Quest } from '@/types/database'

interface QuestsClientProps {
  initialProfile: Profile
  activeQuests: PlayerQuest[]
  availableQuests: Quest[]
}

const QuestsClient = ({ 
  initialProfile,
  activeQuests,
  availableQuests
}: QuestsClientProps) => {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  
  const handleProfileUpdate = (newProfileData: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...newProfileData }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Quests</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveQuests 
            profile={profile}
            quests={activeQuests}
            onProfileUpdate={handleProfileUpdate}
          />
          <QuestBoard 
            profile={profile}
            quests={availableQuests}
          />
        </div>
      </div>
    </div>
  )
}

export default QuestsClient 