'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, Translations, getTranslations } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('de')
  const [translations, setTranslations] = useState<Translations>(getTranslations('de'))

  // Load saved language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('chtime-language') as Language
      if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage)
        setTranslations(getTranslations(savedLanguage))
      } else {
        // Detect browser language
        const browserLanguage = navigator.language.toLowerCase()
        const detectedLanguage = browserLanguage.startsWith('de') ? 'de' : 'en'
        setLanguageState(detectedLanguage)
        setTranslations(getTranslations(detectedLanguage))
      }
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    setTranslations(getTranslations(newLanguage))
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('chtime-language', newLanguage)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 