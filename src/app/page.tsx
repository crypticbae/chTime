'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TimezoneSettings } from '@/components/ui/timezone-settings'
import { DailySummary } from '@/components/ui/daily-summary'
import { AuthGuard } from '@/components/AuthGuard'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Clock, Play, Pause, Square, Coffee, Calendar, Settings, BarChart3, LogOut, User, Shield } from 'lucide-react'
import { db, TimeEntry, UserSettings } from '@/lib/database'
import { authManager } from '@/lib/auth'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

function TimeTrackingApp() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isWorking, setIsWorking] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'Europe/Berlin',
    workHoursTarget: 8,
    theme: 'dark'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [todayWorkTime, setTodayWorkTime] = useState(0)
  const [needsAdminMigration, setNeedsAdminMigration] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load settings and entries from database (only on client)
    if (typeof window !== 'undefined') {
      const userSettings = db.getSettings()
      setSettings(userSettings)
      loadTimeEntries()
      checkAdminMigrationNeeded()
    }

    return () => clearInterval(timer)
  }, [])

  const checkAdminMigrationNeeded = () => {
    // Check if there are users but no admin
    const currentUser = authManager.getCurrentUser()
    if (currentUser && !authManager.isCurrentUserAdmin()) {
      // Check if any admin exists in the system by checking localStorage
      try {
        const usersJson = localStorage.getItem('chtime-users')
        if (usersJson) {
          const users = JSON.parse(usersJson)
          const hasAdmin = users.some((user: any) => user.role === 'admin')
          if (!hasAdmin) {
            setNeedsAdminMigration(true)
          }
        }
      } catch (error) {
        console.error('Error checking admin migration:', error)
      }
    }
  }

  const handleAdminMigration = () => {
    const result = authManager.makeFirstUserAdmin()
    if (result.success) {
      alert(result.message)
      setNeedsAdminMigration(false)
      // Refresh the page to update UI with admin features
      window.location.reload()
    } else {
      alert(`Error: ${result.message}`)
    }
  }

  const loadTimeEntries = () => {
    const currentUserId = authManager.getCurrentUser()?.id
    if (!currentUserId) return

    // Get only current user's entries
    const entries = db.getTimeEntriesForUser(currentUserId)
    setTimeEntries(entries)
    
    // Load today's work time (still using global method for now - could be enhanced)
    const todayWorkDay = db.getTodayWorkDay()
    setTodayWorkTime(todayWorkDay.totalWorkTime)
    
    // Check current status from last entry of current user
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1]
      if (lastEntry.type === 'clock-in') {
        setIsWorking(true)
        setIsOnBreak(false)
      } else if (lastEntry.type === 'break-start') {
        setIsWorking(true)
        setIsOnBreak(true)
      } else if (lastEntry.type === 'break-end') {
        setIsWorking(true)
        setIsOnBreak(false)
      } else if (lastEntry.type === 'clock-out') {
        setIsWorking(false)
        setIsOnBreak(false)
      }
    }
  }

  const addTimeEntry = (type: TimeEntry['type']) => {
    const currentUserId = authManager.getCurrentUser()?.id
    if (!currentUserId) {
      alert(t.errorNotLoggedIn)
      return
    }

    const newEntry = db.saveTimeEntry({
      type,
      timestamp: new Date()
    }, currentUserId)
    
    // Reload entries to get updated list
    loadTimeEntries()
    
    switch (type) {
      case 'clock-in':
        setIsWorking(true)
        setIsOnBreak(false)
        break
      case 'clock-out':
        setIsWorking(false)
        setIsOnBreak(false)
        break
      case 'break-start':
        setIsOnBreak(true)
        break
      case 'break-end':
        setIsOnBreak(false)
        break
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: settings.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: settings.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings)
  }

  const handleLogout = () => {
    if (confirm(t.confirmLogout)) {
      authManager.logout()
      router.push('/auth')
    }
  }

  const currentUser = authManager.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  const getStatusText = () => {
    if (!isWorking) return t.notWorking
    if (isOnBreak) return t.onBreak
    return t.working
  }

  const getStatusColor = () => {
    if (!isWorking) return 'text-muted-foreground'
    if (isOnBreak) return 'text-amber-500 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {t.appName}
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    {t.appDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Status */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/40">
                <div className={`w-2 h-2 rounded-full ${!isWorking ? 'bg-gray-400' : isOnBreak ? 'bg-amber-400' : 'bg-green-400'} animate-pulse`}></div>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              {isWorking && (
                <div className="text-sm text-muted-foreground">
                  {t.today}: {db.formatTime(todayWorkTime)}
                </div>
              )}
            </div>

            {/* User Info and Controls */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              {currentUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/40">
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-red-600" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{currentUser.username}</span>
                  {isAdmin && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                      {t.adminBadge}
                    </span>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSummary(true)}
                  className="h-9 w-9 hover:bg-accent"
                  title={t.overview}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="h-9 w-9 hover:bg-accent"
                  title={t.settings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAdminPanel(true)}
                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                    title={t.adminPanel}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                <LanguageToggle />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 ml-1"
                  title={t.logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Admin Migration Notice */}
          {needsAdminMigration && (
            <div className="mb-6">
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <div>
                        <h3 className="font-medium text-orange-900 dark:text-orange-200">
                          {t.adminSetupRequired}
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          {t.adminSetupDescription}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleAdminMigration}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {t.makeAdmin}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current Time Display */}
          <Card className="mb-8 border-border/40 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-primary mr-3" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {formatDate(currentTime)}
                  </span>
                </div>
                <div className="text-6xl font-mono font-bold text-foreground mb-4">
                  {formatTime(currentTime)}
                </div>
                <div className={`text-lg font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Clock In/Out */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-lg hover:bg-accent/50 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground flex items-center justify-center">
                  {isWorking ? <Square className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isWorking ? t.clockOut : t.clockIn}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isWorking ? 'End work time' : 'Start work time'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className={`w-full h-16 text-lg font-semibold transition-all duration-300 ${
                    isWorking 
                      ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-0' 
                      : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white border-0'
                  }`}
                  onClick={() => addTimeEntry(isWorking ? 'clock-out' : 'clock-in')}
                >
                  {isWorking ? t.clockOut : t.clockIn}
                </Button>
              </CardContent>
            </Card>

            {/* Break Start/End */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-lg hover:bg-accent/50 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground flex items-center justify-center">
                  <Coffee className="w-6 h-6 mr-2" />
                  {isOnBreak ? t.endBreak : t.startBreak}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isOnBreak ? 'Back to work' : 'Take a break'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className={`w-full h-16 text-lg font-semibold transition-all duration-300 ${
                    isOnBreak 
                      ? 'bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white border-0' 
                      : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white border-0'
                  }`}
                  onClick={() => addTimeEntry(isOnBreak ? 'break-end' : 'break-start')}
                  disabled={!isWorking}
                >
                  {isOnBreak ? 'Pause beenden' : 'Pause beginnen'}
                </Button>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card className="border-border/40 bg-card/80 backdrop-blur-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground flex items-center justify-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  {t.today}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.workTimeProgress}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {db.formatTime(todayWorkTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    von {settings.workHoursTarget}h Ziel
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-3">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (todayWorkTime / (settings.workHoursTarget * 60)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-lg">
            <CardHeader>
                              <CardTitle className="text-foreground">{t.latestActivities}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.yourLatestTimestamps}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries
                  .slice(-10)
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-accent/30 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {entry.type === 'clock-in' && <Play className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        {entry.type === 'clock-out' && <Square className="w-5 h-5 text-red-500 dark:text-red-400" />}
                        {entry.type === 'break-start' && <Pause className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                        {entry.type === 'break-end' && <Coffee className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
                        <div>
                          <div className="text-foreground font-medium">
                            {entry.type === 'clock-in' && t.clockedIn}
                            {entry.type === 'clock-out' && t.clockedOut}
                            {entry.type === 'break-start' && t.breakStarted}
                            {entry.type === 'break-end' && t.breakEnded}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-foreground font-mono font-bold">
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  ))}
                {timeEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.noActivitiesToday}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo Data Controls - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30 flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm(t.confirmLoadDemo)) {
              db.generateDummyData()
              loadTimeEntries()
              alert(t.demoDataLoaded)
            }
          }}
          className="text-xs px-2 py-1 h-6 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent opacity-60 hover:opacity-100 transition-opacity"
          title={t.loadDemo}
        >
          {t.loadDemo}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm(t.confirmDeleteAll)) {
              db.clearAll()
              loadTimeEntries()
              alert(t.allDataDeleted)
            }
          }}
          className="text-xs px-2 py-1 h-6 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent text-red-600 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity"
          title={t.clearData}
        >
          {t.clearData}
        </Button>
      </div>

      {/* Modals */}
      <TimezoneSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
      
      <DailySummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        settings={settings}
      />
      
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <TimeTrackingApp />
    </AuthGuard>
  )
} 