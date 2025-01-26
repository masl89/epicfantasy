'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/game')
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth/login')
      }
      router.refresh()
      setIsLoading(false)
    })

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/game')
      }
      setIsLoading(false)
    }
    
    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return children
} 