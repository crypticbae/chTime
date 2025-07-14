'use client'

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-9 w-9 hover:bg-accent relative"
      title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
    >
      <Languages className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
        {language.toUpperCase()}
      </span>
    </Button>
  )
} 