'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authManager } from '@/lib/auth'
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long'
    }

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email address required'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    // Check if registration is enabled (unless this is first user)
    if (authManager.hasUsers() && !authManager.isRegistrationEnabled()) {
      setErrors({ general: t.registrationCurrentlyDisabled })
      setIsLoading(false)
      return
    }

    try {
      const result = await authManager.register(
        formData.username,
        formData.email,
        formData.password
      )

      if (result.success) {
        // Auto-login after successful registration
        await authManager.login(formData.username, formData.password)
        onSuccess()
      } else {
        setErrors({ general: result.error || 'Registration failed' })
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

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' }
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'bg-red-500' }
    if (password.length < 8) return { strength: 2, text: 'Medium', color: 'bg-yellow-500' }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, text: 'Strong', color: 'bg-green-500' }
    }
    return { strength: 2, text: 'Medium', color: 'bg-yellow-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <Card className="w-full max-w-md mx-auto border-border/40 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
          <User className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Welcome to chTime</CardTitle>
        <CardDescription className="text-center">
          Create your account for time tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="username"
                type="text"
                placeholder={t.yourUsernameLabel}
                value={formData.username}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('username', e.target.value)}
                className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
                            <Label htmlFor="email">{t.emailAddress}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                                  placeholder={t.yourEmail}
                value={formData.email}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
                            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                                  placeholder={t.yourPassword}
                value={formData.password}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.strength === 3 ? 'text-green-600' : 
                  passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {t.passwordStrength}: {passwordStrength.text}
                </p>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder={t.repeatPassword}
                value={formData.confirmPassword}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">Passwörter stimmen überein</span>
              </div>
            )}
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? t.creatingAccount : t.createAccount}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline"
              disabled={isLoading}
                          >
                {t.signInNow}
              </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 