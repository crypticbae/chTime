'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, parseISO, isToday, startOfWeek, endOfWeek, eachDayOfInterval, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, FileText, X, Download, TrendingUp, BarChart3, Users, CalendarRange, ChevronLeft, ChevronRight, Coffee, Target } from 'lucide-react'
import { TimeEntry } from '@/lib/types'
import { calculateWorkDay, formatDuration } from '@/lib/utils'
import { useSettings } from '@/contexts/SettingsContext'
import { authManager } from '@/lib/auth'
import { db } from '@/lib/database'
import { useLanguage } from '@/contexts/LanguageContext'
import { PDFExporter } from '@/lib/pdf-export'

interface DailySummaryProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
}

export function DailySummary({ isOpen, onClose, settings }: DailySummaryProps) {
  const { t, language } = useLanguage()
  const [viewMode, setViewMode] = React.useState<'day' | 'range'>('day')
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [startDate, setStartDate] = React.useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6) // Default to last 7 days
    return date
  })
  const [endDate, setEndDate] = React.useState(new Date())
  const [workDay, setWorkDay] = React.useState<WorkDay | null>(null)
  const [weekSummary, setWeekSummary] = React.useState<WorkDay[]>([])
  const [rangeSummary, setRangeSummary] = React.useState<any>(null)

  React.useEffect(() => {
    if (!isOpen) return

    const loadData = () => {
      if (viewMode === 'day') {
        // Load work day for selected date
        const day = db.getWorkDay(selectedDate)
        setWorkDay(day)
        
        // Load week summary
        const summary = db.getWorkSummary(7)
        setWeekSummary(summary)
      } else {
        // Load date range summary only if dates are valid
        if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const rangeSummaryData = db.getDateRangeSummary(startDate, endDate)
          setRangeSummary(rangeSummaryData)
        }
      }
    }

    // Use timeout to prevent setState during render
    const timeoutId = setTimeout(loadData, 0)
    return () => clearTimeout(timeoutId)
  }, [isOpen, selectedDate, viewMode, startDate, endDate])

  const loadWorkDay = () => {
    const day = db.getWorkDay(selectedDate)
    setWorkDay(day)
  }

  const loadWeekSummary = () => {
    const summary = db.getWorkSummary(7)
    setWeekSummary(summary)
  }

  const formatTimeWithTimezone = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return '--:--'
    }
    return dateObj.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: settings.timezone,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateWithTimezone = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return t.invalidDate
    }
    return dateObj.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: settings.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const calculateProgress = (workedMinutes: number) => {
    const targetMinutes = settings.workHoursTarget * 60
    return Math.min((workedMinutes / targetMinutes) * 100, 100)
  }

  const getTotalWeekTime = () => {
    return weekSummary.reduce((total, day) => total + day.totalWorkTime, 0)
  }

  const getAverageDaily = () => {
    if (weekSummary.length === 0) return 0
    return getTotalWeekTime() / weekSummary.length
  }

  const handleExportDayReport = async () => {
    try {
      await PDFExporter.exportDayReport(workDay, selectedDate, settings, language)
    } catch (error) {
      console.error('PDF Export Error:', error)
      alert(t.errorSaving)
    }
  }

  const handleExportRangeReport = async () => {
    try {
      if (!rangeSummary) return
      
      await PDFExporter.exportRangeReport({
        title: t.pdfTitle,
        dateRange: {
          start: startDate,
          end: endDate
        },
        workDays: rangeSummary.workDays,
        settings,
        summaryData: rangeSummary,
        language
      })
    } catch (error) {
      console.error('PDF Export Error:', error)
      alert(t.errorSaving)
    }
  }

  if (!isOpen) return null

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const progress = workDay ? calculateProgress(workDay.totalWorkTime) : 0
  const targetMinutes = settings.workHoursTarget * 60

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] border-border/40 bg-card/95 backdrop-blur flex flex-col">
        <CardHeader className="border-b border-border/40 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="w-5 h-5" />
                {t.workSummary}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.pdfSubtitle}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {viewMode === 'day' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportDayReport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF Export
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportRangeReport}
                  disabled={!rangeSummary}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {t.generatePDF}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                {t.close}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/40">
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'day'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {t.dailySummary}
              </button>
              <button
                onClick={() => setViewMode('range')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'range'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                {t.selectDateRange}
              </button>
            </div>

            {viewMode === 'day' ? (
              <>
                {/* Date Navigation */}
                <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                                      {t.previousDay}
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {formatDateWithTimezone(selectedDate)}
                </h2>
                {isToday && (
                  <span className="text-sm text-primary font-medium">{t.today}</span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                disabled={selectedDate >= new Date()}
                className="flex items-center gap-2"
              >
                Next Day
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Daily Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Work Time */}
              <Card className="border-border/40 bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.workTime}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {workDay ? db.formatTime(workDay.totalWorkTime) : '0h 00m'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Break Time */}
              <Card className="border-border/40 bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.breakTime}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {workDay ? db.formatTime(workDay.totalBreakTime) : '0h 00m'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Progress */}
              <Card className="border-border/40 bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.workHoursTarget}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(progress)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            {workDay && (
              <Card className="border-border/40 bg-muted/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {t.progressToTarget} ({settings.workHoursTarget}h)
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {db.formatTime(workDay.totalWorkTime)} / {db.formatTime(targetMinutes)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary rounded-full h-3 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progress >= 100 && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        {t.targetReached}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Entries */}
            {workDay && workDay.entries.length > 0 && (
              <Card className="border-border/40 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.activitiesOfDay}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t.chronologicalOverview}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workDay.entries
                      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                      .map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-foreground font-medium">
                              {entry.type === 'clock-in' && t.clockedIn}
                              {entry.type === 'clock-out' && t.clockedOut}
                              {entry.type === 'break-start' && t.breakStarted}
                              {entry.type === 'break-end' && t.breakEnded}
                            </span>
                          </div>
                          <span className="text-muted-foreground font-mono">
                            {formatTimeWithTimezone(entry.timestamp)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Week Summary */}
            <Card className="border-border/40 bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5" />
                  {t.weekOverview}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.last7DaysOverview}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">{t.totalThisWeek}</p>
                    <p className="text-xl font-bold text-foreground">
                      {db.formatTime(getTotalWeekTime())}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground">{t.dailyAverage}</p>
                    <p className="text-xl font-bold text-foreground">
                      {db.formatTime(Math.round(getAverageDaily()))}
                    </p>
                  </div>
                </div>
                
                {weekSummary.length > 0 && (
                  <div className="space-y-2">
                    {weekSummary.map((day) => {
                      const dayProgress = calculateProgress(day.totalWorkTime)
                      return (
                        <div key={day.date} className="flex items-center gap-3 p-2 rounded">
                          <span className="text-sm w-20 text-muted-foreground">
                            {new Date(day.date + 'T00:00:00').toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${dayProgress}%` }}
                            />
                          </div>
                          <span className="text-sm w-16 text-right text-foreground">
                            {db.formatTime(day.totalWorkTime)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

                {!workDay && (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      {t.noActivitiesForDay}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Quick Date Range Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastWeek = new Date()
                      lastWeek.setDate(today.getDate() - 6)
                      setStartDate(lastWeek)
                      setEndDate(today)
                    }}
                    className="text-xs"
                  >
                    {t.last7Days}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date()
                      lastMonth.setDate(today.getDate() - 29)
                      setStartDate(lastMonth)
                      setEndDate(today)
                    }}
                    className="text-xs"
                  >
                    {t.last30Days}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                      setStartDate(thisMonthStart)
                      setEndDate(today)
                    }}
                    className="text-xs"
                  >
                    {t.thisMonth}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
                      setStartDate(lastMonthStart)
                      setEndDate(lastMonthEnd)
                    }}
                    className="text-xs"
                  >
                    {t.lastMonth}
                  </Button>
                </div>

                {/* Date Range Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                                              {t.startDate}
                    </label>
                    <input
                      type="date"
                      value={startDate && !isNaN(startDate.getTime()) ? startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value)
                        if (!isNaN(newDate.getTime())) {
                          setStartDate(newDate)
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                                              {t.endDate}
                    </label>
                    <input
                      type="date"
                      value={endDate && !isNaN(endDate.getTime()) ? endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value)
                        if (!isNaN(newDate.getTime())) {
                          setEndDate(newDate)
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Range Summary Cards */}
                {rangeSummary && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border-border/40 bg-muted/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t.totalWorkTime}</p>
                              <p className="text-xl font-bold text-foreground">
                                {db.formatTime(rangeSummary.totalWorkTime)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/40 bg-muted/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t.totalBreaks}</p>
                              <p className="text-xl font-bold text-foreground">
                                {db.formatTime(rangeSummary.totalBreakTime)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/40 bg-muted/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t.workingDays}</p>
                              <p className="text-xl font-bold text-foreground">
                                {rangeSummary.workingDays}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/40 bg-muted/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t.averagePerWorkDay}</p>
                              <p className="text-xl font-bold text-foreground">
                                {db.formatTime(Math.round(rangeSummary.averageWorkTimePerWorkingDay))}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                                         {/* Additional Statistics */}
                     <Card className="border-border/40 bg-muted/20">
                       <CardHeader>
                         <CardTitle className="text-foreground">Detailstatistiken</CardTitle>
                       </CardHeader>
                       <CardContent>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                           <div className="p-3 rounded-lg bg-background/50">
                             <p className="text-sm text-muted-foreground">{t.pdfPeriod}</p>
                             <p className="text-lg font-bold text-foreground">
                               {rangeSummary.totalRangeDays} {t.days}
                             </p>
                           </div>
                           <div className="p-3 rounded-lg bg-background/50">
                             <p className="text-sm text-muted-foreground">{t.averagePerDay}</p>
                             <p className="text-lg font-bold text-foreground">
                               {db.formatTime(Math.round(rangeSummary.averageWorkTimePerDay))}
                             </p>
                           </div>
                           <div className="p-3 rounded-lg bg-background/50">
                             <p className="text-sm text-muted-foreground">Erste Aktivität</p>
                             <p className="text-lg font-bold text-foreground">
                               {rangeSummary.earliestEntry ? formatDateWithTimezone(rangeSummary.earliestEntry.timestamp).split(',')[0] : '-'}
                             </p>
                           </div>
                           <div className="p-3 rounded-lg bg-background/50">
                             <p className="text-sm text-muted-foreground">{t.lastActivity}</p>
                             <p className="text-lg font-bold text-foreground">
                               {rangeSummary.latestEntry ? formatDateWithTimezone(rangeSummary.latestEntry.timestamp).split(',')[0] : '-'}
                             </p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>

                     {/* Daily Breakdown */}
                    <Card className="border-border/40 bg-muted/20">
                      <CardHeader>
                        <CardTitle className="text-foreground">{t.dailyOverview}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {t.workSummary} ({formatDateWithTimezone(rangeSummary.dateRange.start)} - {formatDateWithTimezone(rangeSummary.dateRange.end)})
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {rangeSummary.workDays.length > 0 ? (
                          <div className="space-y-2">
                            {rangeSummary.workDays.map((day: WorkDay) => {
                              const dayProgress = calculateProgress(day.totalWorkTime)
                              return (
                                <div key={day.date} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/20">
                                  <span className="text-sm w-24 text-muted-foreground">
                                    {new Date(day.date + 'T00:00:00').toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: '2-digit'
                                    })}
                                  </span>
                                  <div className="flex-1 bg-muted rounded-full h-3">
                                    <div
                                      className="bg-primary rounded-full h-3 transition-all"
                                      style={{ width: `${dayProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm w-20 text-right text-foreground font-mono">
                                    {db.formatTime(day.totalWorkTime)}
                                  </span>
                                  {day.totalBreakTime > 0 && (
                                    <span className="text-xs w-16 text-right text-muted-foreground">
                                      +{db.formatTime(day.totalBreakTime)} Pause
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground">
                              {t.pdfNoEntries}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 