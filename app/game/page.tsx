import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

const GameDashboard = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  // Get user profile with full stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single()

  // Get active quests
  const { data: activeQuests } = await supabase
    .from('player_quests')
    .select(`
      *,
      quest:quests(
        *,
        item_reward:items(*)
      )
    `)
    .eq('profile_id', profile?.id)
    .eq('is_working', true)
    .not('status', 'eq', 'completed')
    .order('started_at', { ascending: false })
    .limit(3)

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('*')
    .eq('profile_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate level and experience
  const calculateLevel = (totalExp: number) => {
    // Each level requires level * 100 exp
    // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
    let level = 1;
    let remainingExp = totalExp;
    
    while (remainingExp >= level * 100) {
      remainingExp -= level * 100;
      level++;
    }
    
    return {
      level,
      currentLevelExp: remainingExp,
      expForNextLevel: level * 100
    };
  }

  const levelInfo = profile?.experience 
    ? calculateLevel(profile.experience)
    : { level: 1, currentLevelExp: 0, expForNextLevel: 100 };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.username}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player Stats Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Player Stats</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Level {levelInfo.level}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-1">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${(levelInfo.currentLevelExp / levelInfo.expForNextLevel) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {levelInfo.currentLevelExp}/{levelInfo.expForNextLevel} XP
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total XP: {profile?.experience || 0}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gold: {profile?.gold}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Class: {profile?.character_class}
              </p>
            </div>
          </div>

          {/* Active Quests Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Active Quests</h2>
            {activeQuests && activeQuests.length > 0 ? (
              <div className="space-y-2">
                {activeQuests.map(quest => (
                  <div key={quest.id} className="text-sm">
                    <p className="font-medium">{quest.quest?.title}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Progress: {quest.progress}%
                    </p>
                  </div>
                ))}
                <Link 
                  href="/game/quests"
                  className="text-blue-600 hover:text-blue-500 text-sm block mt-2"
                >
                  View all quests →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No active quests. Visit the <Link href="/game/quests" className="text-blue-600 hover:text-blue-500">Quest Board</Link> to start one!
              </p>
            )}
          </div>

          {/* Recent Activity Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="text-sm">
                    <p className="text-gray-600 dark:text-gray-300">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDashboard 