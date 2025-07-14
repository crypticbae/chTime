'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { authManager } from '@/lib/auth'
import { Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AuthPage() {
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    if (authManager.isAuthenticated()) {
      router.push('/')
      return
    }

    // Check if this is first time setup
    setIsFirstTimeSetup(!authManager.hasUsers())
  }, [router])

  const handleAuthSuccess = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* chTime Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur border border-white/20">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            ch<span className="text-blue-400">Time</span>
          </h1>
          <p className="text-white/70 text-lg">
            {t.professionalTimeTracking}
          </p>
          
          {isFirstTimeSetup && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur">
              <p className="text-blue-200 text-sm font-medium">
                {t.welcomeFirstAccount}
              </p>
            </div>
          )}
        </div>

        {/* Auth Forms */}
        {isLogin ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-sm">
          <p>{t.yourTimePerfectlyCaptured}</p>
        </div>
      </div>
    </div>
  )
} 