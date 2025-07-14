'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/auth'
import { Clock } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authManager.isAuthenticated()
      setIsAuthenticated(authenticated)
      
      if (!authenticated) {
        // Redirect to auth page if not authenticated
        router.push('/auth')
      }
      
      setIsLoading(false)
    }

    // Check authentication status
    checkAuth()
  }, [router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur border border-white/20 animate-pulse">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ch<span className="text-blue-400">Time</span>
          </h1>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70 mt-2 text-sm">Lade Anwendung...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 