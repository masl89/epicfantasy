import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const GameLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <nav className="p-4 space-y-2">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">Epic Fantasy</h2>
          </div>
          <ul className="space-y-2">
            <li>
              <Link
                href="/game"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                tabIndex={0}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/game/character"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                tabIndex={0}
              >
                Character
              </Link>
            </li>
            <li>
              <Link
                href="/game/inventory"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                tabIndex={0}
              >
                Inventory
              </Link>
            </li>
            <li>
              <Link
                href="/game/quests"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                tabIndex={0}
              >
                Quests
              </Link>
            </li>
          </ul>
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t dark:border-gray-700">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default GameLayout 