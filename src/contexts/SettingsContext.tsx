"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserSettings } from '@/lib/types'
import { db } from '@/lib/database'

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'Europe/Berlin',
    workHoursTarget: 8,
    theme: 'dark'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load settings from database
    const loadSettings = () => {
      try {
        const userSettings = db.getSettings()
        setSettings(userSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      db.saveSettings(updatedSettings)
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 