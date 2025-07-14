'use client'

import * as React from "react"
import { Settings, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db, UserSettings } from "@/lib/database"
import { useLanguage } from '@/contexts/LanguageContext'

// Common timezones grouped by regions
const TIMEZONES = [
  { group: 'Deutschland', zones: ['Europe/Berlin'] },
  { group: 'Europa', zones: [
    'Europe/London', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid',
    'Europe/Amsterdam', 'Europe/Vienna', 'Europe/Zurich', 'Europe/Stockholm'
  ]},
  { group: 'Nordamerika', zones: [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Vancouver'
  ]},
  { group: 'Asien', zones: [
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore',
    'Asia/Dubai', 'Asia/Kolkata'
  ]},
  { group: 'Weitere', zones: [
    'Australia/Sydney', 'Pacific/Auckland', 'Africa/Cairo'
  ]}
]

interface TimezoneSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (settings: UserSettings) => void
}

export function TimezoneSettings({ isOpen, onClose, onSettingsChange }: TimezoneSettingsProps) {
  const { t, language } = useLanguage()
  const [settings, setSettings] = React.useState<UserSettings>(db.getSettings())
  const [selectedTimezone, setSelectedTimezone] = React.useState(settings.timezone)

  const handleSave = () => {
    const newSettings = { ...settings, timezone: selectedTimezone }
    setSettings(newSettings)
    db.saveSettings(newSettings)
    onSettingsChange(newSettings)
    onClose()
  }

  const formatTimezoneDisplay = (timezone: string) => {
    try {
      const now = new Date()
      const timeString = now.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      })
      const offsetString = now.toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).split(' ').pop()
      
      return `${timezone.replace('_', ' ')} (${timeString} ${offsetString})`
    } catch {
      return timezone
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] border-border/40 bg-card/95 backdrop-blur flex flex-col">
        <CardHeader className="border-b border-border/40 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="w-5 h-5" />
                {t.settings}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.timezoneSettings}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              {t.close}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-6">
            {/* Current Timezone Info */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{t.timezoneSettings}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatTimezoneDisplay(settings.timezone)}
              </p>
            </div>

            {/* Timezone Selection */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">{t.selectTimezone}</h3>
              <div className="space-y-4">
                {TIMEZONES.map((group) => (
                  <div key={group.group}>
                    <h4 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wider">
                      {group.group}
                    </h4>
                    <div className="grid gap-2">
                      {group.zones.map((timezone) => (
                        <button
                          key={timezone}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border text-left transition-colors
                            ${selectedTimezone === timezone
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/40 bg-muted/20 hover:bg-accent/50 text-foreground'
                            }
                          `}
                          onClick={() => setSelectedTimezone(timezone)}
                        >
                          <span className="text-sm">
                            {formatTimezoneDisplay(timezone)}
                          </span>
                          {selectedTimezone === timezone && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Hours Target */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">{t.dailyWorkTarget}</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={settings.workHoursTarget}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workHoursTarget: parseFloat(e.target.value) || 8
                  }))}
                  className="w-20 px-3 py-2 rounded-lg border border-border/40 bg-background text-foreground text-center"
                />
                <span className="text-muted-foreground">{t.hours}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t border-border/40 p-6 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t.save}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 