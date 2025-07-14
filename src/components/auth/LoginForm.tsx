'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authManager } from '@/lib/auth'
import { Eye, EyeOff, LogIn, User } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.usernameOrEmail) {
      newErrors.usernameOrEmail = 'Username or email required'
    }

    if (!formData.password) {
      newErrors.password = 'Password required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await authManager.login(
        formData.usernameOrEmail,
        formData.password
      )

      if (result.success) {
        onSuccess()
      } else {
        setErrors({ general: result.error || 'Anmeldung fehlgeschlagen' })
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border/40 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
          <LogIn className="w-6 h-6 text-primary" />
        </div>
                      <CardTitle className="text-2xl text-center">{t.welcomeBack}</CardTitle>
                  <CardDescription className="text-center">
            {t.signInToAccount}
          </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Username/Email Field */}
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail">Username or Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Your username or email"
                value={formData.usernameOrEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('usernameOrEmail', e.target.value)}
                className={`pl-10 ${errors.usernameOrEmail ? 'border-red-500' : ''}`}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            {errors.usernameOrEmail && (
              <p className="text-sm text-red-600">{errors.usernameOrEmail}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                                  placeholder={t.yourPassword}
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? t.signingIn : t.signIn}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t.noAccountYet}{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              {t.registerNow}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 