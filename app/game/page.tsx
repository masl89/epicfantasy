import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GameDashboard = async () => {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player Stats Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Player Stats</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Level: 1
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Experience: 0/100
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gold: 0
              </p>
            </div>
          </div>

          {/* Active Quests Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Active Quests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No active quests
            </p>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDashboard 