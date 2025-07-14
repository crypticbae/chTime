// Simple local database using localStorage with JSON
export interface TimeEntry {
  id: string
  userId: string
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end'
  timestamp: Date
  timezone: string
}

export interface WorkDay {
  date: string // YYYY-MM-DD format
  entries: TimeEntry[]
  totalWorkTime: number // in minutes
  totalBreakTime: number // in minutes
}

export interface UserSettings {
  timezone: string
  workHoursTarget: number // daily target in hours
  theme: 'light' | 'dark'
}

class LocalDatabase {
  private readonly KEYS = {
    TIME_ENTRIES: 'chtime_entries',
    WORK_DAYS: 'chtime_workdays',
    SETTINGS: 'chtime_settings'
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  // Settings management
  getSettings(): UserSettings {
    const defaultSettings: UserSettings = {
      timezone: typeof window !== 'undefined' 
        ? Intl.DateTimeFormat().resolvedOptions().timeZone 
        : 'Europe/Berlin',
      workHoursTarget: 8,
      theme: 'dark'
    }

    if (!this.isClient()) return defaultSettings
    
    const saved = localStorage.getItem(this.KEYS.SETTINGS)
    if (!saved) return defaultSettings
    
    try {
      return { ...defaultSettings, ...JSON.parse(saved) }
    } catch {
      return defaultSettings
    }
  }

  saveSettings(settings: UserSettings): void {
    if (!this.isClient()) return
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings))
  }

  // Time entries management
  getTimeEntries(): TimeEntry[] {
    if (!this.isClient()) return []
    
    const saved = localStorage.getItem(this.KEYS.TIME_ENTRIES)
    if (!saved) return []
    
    try {
      return JSON.parse(saved).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    } catch {
      return []
    }
  }

  saveTimeEntry(entry: Omit<TimeEntry, 'id' | 'timezone' | 'userId'>, userId?: string): TimeEntry {
    // Import authManager here to avoid circular dependency
    const { authManager } = require('@/lib/auth')
    const currentUserId = userId || authManager?.getCurrentUser()?.id || 'default-user'
    
    if (!this.isClient()) {
      return {
        ...entry,
        id: Date.now().toString(),
        timezone: 'Europe/Berlin',
        userId: currentUserId
      }
    }

    const settings = this.getSettings()
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      timezone: settings.timezone,
      userId: currentUserId
    }
    
    const entries = this.getTimeEntries()
    entries.push(newEntry)
    localStorage.setItem(this.KEYS.TIME_ENTRIES, JSON.stringify(entries))
    
    // Update work day summary
    this.updateWorkDay(newEntry)
    
    return newEntry
  }

  // Work days management
  getWorkDays(): WorkDay[] {
    if (!this.isClient()) return []
    
    const saved = localStorage.getItem(this.KEYS.WORK_DAYS)
    if (!saved) return []
    
    try {
      return JSON.parse(saved).map((workDay: any) => ({
        ...workDay,
        entries: workDay.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }))
    } catch {
      return []
    }
  }

  getWorkDay(date: Date): WorkDay | null {
    const dateStr = this.formatDateKey(date)
    const workDays = this.getWorkDays()
    return workDays.find(day => day.date === dateStr) || null
  }

  getTodayWorkDay(): WorkDay {
    const today = new Date()
    const existing = this.getWorkDay(today)
    
    if (existing) return existing
    
    // Create new work day
    const newWorkDay: WorkDay = {
      date: this.formatDateKey(today),
      entries: [],
      totalWorkTime: 0,
      totalBreakTime: 0
    }
    
    return newWorkDay
  }

  private updateWorkDay(entry: TimeEntry): void {
    if (!this.isClient()) return

    const dateStr = this.formatDateKey(entry.timestamp)
    const workDays = this.getWorkDays()
    
    let workDay = workDays.find(day => day.date === dateStr)
    if (!workDay) {
      workDay = {
        date: dateStr,
        entries: [],
        totalWorkTime: 0,
        totalBreakTime: 0
      }
      workDays.push(workDay)
    }
    
    // Add entry to work day
    workDay.entries.push(entry)
    
    // Recalculate times
    this.calculateWorkDayTimes(workDay)
    
    // Save updated work days
    localStorage.setItem(this.KEYS.WORK_DAYS, JSON.stringify(workDays))
  }

  private calculateWorkDayTimes(workDay: WorkDay): void {
    const entries = workDay.entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    
    let totalWorkTime = 0
    let totalBreakTime = 0
    let workStartTime: Date | null = null
    let breakStartTime: Date | null = null
    
    for (const entry of entries) {
      switch (entry.type) {
        case 'clock-in':
          workStartTime = entry.timestamp
          break
          
        case 'clock-out':
          if (workStartTime) {
            totalWorkTime += entry.timestamp.getTime() - workStartTime.getTime()
            workStartTime = null
          }
          break
          
        case 'break-start':
          // Stop current work session if running
          if (workStartTime) {
            totalWorkTime += entry.timestamp.getTime() - workStartTime.getTime()
            workStartTime = null
          }
          breakStartTime = entry.timestamp
          break
          
        case 'break-end':
          if (breakStartTime) {
            totalBreakTime += entry.timestamp.getTime() - breakStartTime.getTime()
            breakStartTime = null
          }
          // Resume work after break
          workStartTime = entry.timestamp
          break
      }
    }
    
    // Convert from milliseconds to minutes
    workDay.totalWorkTime = Math.round(totalWorkTime / (1000 * 60))
    workDay.totalBreakTime = Math.round(totalBreakTime / (1000 * 60))
  }

  // Helper methods
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins.toString().padStart(2, '0')}m`
  }

  // Get work summary for last N days
  getWorkSummary(days: number = 7): WorkDay[] {
    const workDays = this.getWorkDays()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = this.formatDateKey(cutoffDate)
    
    return workDays
      .filter(day => day.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  // Date range analysis functions
  getWorkDaysInRange(startDate: Date, endDate: Date): WorkDay[] {
    const workDays = this.getWorkDays()
    const startStr = this.formatDateKey(startDate)
    const endStr = this.formatDateKey(endDate)
    
    return workDays
      .filter(day => day.date >= startStr && day.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  getDateRangeSummary(startDate: Date, endDate: Date) {
    const workDays = this.getWorkDaysInRange(startDate, endDate)
    
    const totalWorkTime = workDays.reduce((sum, day) => sum + day.totalWorkTime, 0)
    const totalBreakTime = workDays.reduce((sum, day) => sum + day.totalBreakTime, 0)
    const workingDays = workDays.filter(day => day.totalWorkTime > 0).length
    
    // Calculate date range in days
    const timeDiff = endDate.getTime() - startDate.getTime()
    const totalRangeDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    // Get earliest and latest timestamps
    const allEntries = workDays.flatMap(day => day.entries)
    const earliestEntry = allEntries.length > 0 ? 
      allEntries.reduce((earliest, entry) => 
        entry.timestamp < earliest.timestamp ? entry : earliest
      ) : null
    const latestEntry = allEntries.length > 0 ? 
      allEntries.reduce((latest, entry) => 
        entry.timestamp > latest.timestamp ? entry : latest
      ) : null

    // Calculate weekly breakdown
    const weeklyBreakdown: { [weekStart: string]: { workTime: number, breakTime: number, days: number } } = {}
    workDays.forEach(day => {
      const date = new Date(day.date + 'T00:00:00')
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = this.formatDateKey(weekStart)
      
      if (!weeklyBreakdown[weekKey]) {
        weeklyBreakdown[weekKey] = { workTime: 0, breakTime: 0, days: 0 }
      }
      weeklyBreakdown[weekKey].workTime += day.totalWorkTime
      weeklyBreakdown[weekKey].breakTime += day.totalBreakTime
      if (day.totalWorkTime > 0) {
        weeklyBreakdown[weekKey].days++
      }
    })

    return {
      workDays,
      totalWorkTime,
      totalBreakTime,
      workingDays,
      totalRangeDays,
      averageWorkTimePerWorkingDay: workingDays > 0 ? totalWorkTime / workingDays : 0,
      averageWorkTimePerDay: totalRangeDays > 0 ? totalWorkTime / totalRangeDays : 0,
      earliestEntry,
      latestEntry,
      weeklyBreakdown,
      dateRange: {
        start: startDate,
        end: endDate,
        formattedStart: this.formatDateKey(startDate),
        formattedEnd: this.formatDateKey(endDate)
      }
    }
  }

  // Generate dummy data for testing
  generateDummyData(): void {
    if (!this.isClient()) return

    const startDate = new Date('2025-01-01')
    const endDate = new Date()
    const currentDate = new Date(startDate)

    // Get current user ID for dummy data
    const { authManager } = require('@/lib/auth')
    const currentUserId = authManager?.getCurrentUser()?.id || 'default-user'

    // Clear existing data first
    localStorage.removeItem(this.KEYS.TIME_ENTRIES)
    localStorage.removeItem(this.KEYS.WORK_DAYS)

    const allEntries: TimeEntry[] = []
    let entryIdCounter = 1

    while (currentDate <= endDate) {
      // Skip some weekends randomly (not everyone works weekends)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
      const skipDay = Math.random() < 0.7 && isWeekend // 70% chance to skip weekends
      
      // Skip some random weekdays (vacation, sick days, etc.)
      const skipWeekday = Math.random() < 0.1 // 10% chance to skip weekdays

      if (!skipDay && !skipWeekday) {
        // Generate work day
        const workStart = new Date(currentDate)
        
        // Random start time between 7:00 and 9:30
        const startHour = 7 + Math.random() * 2.5
        workStart.setHours(Math.floor(startHour), Math.floor((startHour % 1) * 60), 0, 0)

        // Clock in
        const clockInEntry: TimeEntry = {
          id: `entry-${entryIdCounter++}`,
          userId: currentUserId,
          type: 'clock-in',
          timestamp: new Date(workStart),
          timezone: 'Europe/Berlin'
        }
        allEntries.push(clockInEntry)

        let currentTime = new Date(workStart)
        
        // Work session 1 (2-4 hours)
        const session1Duration = (2 + Math.random() * 2) * 60 * 60 * 1000
        currentTime = new Date(currentTime.getTime() + session1Duration)

        // Morning break (10-30 minutes)
        if (Math.random() < 0.8) { // 80% chance of morning break
          const breakStartEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-start',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(breakStartEntry)

          const breakDuration = (10 + Math.random() * 20) * 60 * 1000
          currentTime = new Date(currentTime.getTime() + breakDuration)

          const breakEndEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-end',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(breakEndEntry)
        }

        // Work session 2 (1.5-3 hours)
        const session2Duration = (1.5 + Math.random() * 1.5) * 60 * 60 * 1000
        currentTime = new Date(currentTime.getTime() + session2Duration)

        // Lunch break (30-90 minutes)
        if (Math.random() < 0.9) { // 90% chance of lunch break
          const lunchStartEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-start',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(lunchStartEntry)

          const lunchDuration = (30 + Math.random() * 60) * 60 * 1000
          currentTime = new Date(currentTime.getTime() + lunchDuration)

          const lunchEndEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-end',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(lunchEndEntry)
        }

        // Work session 3 (2-4 hours)
        const session3Duration = (2 + Math.random() * 2) * 60 * 60 * 1000
        currentTime = new Date(currentTime.getTime() + session3Duration)

        // Afternoon break (5-20 minutes)
        if (Math.random() < 0.6) { // 60% chance of afternoon break
          const breakStartEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-start',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(breakStartEntry)

          const breakDuration = (5 + Math.random() * 15) * 60 * 1000
          currentTime = new Date(currentTime.getTime() + breakDuration)

          const breakEndEntry: TimeEntry = {
            id: `entry-${entryIdCounter++}`,
            userId: currentUserId,
            type: 'break-end',
            timestamp: new Date(currentTime),
            timezone: 'Europe/Berlin'
          }
          allEntries.push(breakEndEntry)
        }

        // Final work session (0.5-2 hours)
        const finalSessionDuration = (0.5 + Math.random() * 1.5) * 60 * 60 * 1000
        currentTime = new Date(currentTime.getTime() + finalSessionDuration)

        // Clock out
        const clockOutEntry: TimeEntry = {
          id: `entry-${entryIdCounter++}`,
          userId: currentUserId,
          type: 'clock-out',
          timestamp: new Date(currentTime),
          timezone: 'Europe/Berlin'
        }
        allEntries.push(clockOutEntry)
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Save all entries to localStorage
    localStorage.setItem(this.KEYS.TIME_ENTRIES, JSON.stringify(allEntries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    }))))

    // Process all entries to create work days
    allEntries.forEach(entry => this.updateWorkDay(entry))

    console.log(`Generated ${allEntries.length} dummy entries from 2025-01-01 to ${endDate.toDateString()}`)
  }

  // Clear all data (for testing)
  clearAll(): void {
    if (!this.isClient()) return
    localStorage.removeItem(this.KEYS.TIME_ENTRIES)
    localStorage.removeItem(this.KEYS.WORK_DAYS)
    localStorage.removeItem(this.KEYS.SETTINGS)
  }

  // Admin methods for managing other users' time entries
  getTimeEntriesForUser(userId: string): TimeEntry[] {
    const allEntries = this.getTimeEntries()
    return allEntries.filter(entry => entry.userId === userId)
  }

  getTimeEntriesForUserAndDate(userId: string, date: string): TimeEntry[] {
    const userEntries = this.getTimeEntriesForUser(userId)
    return userEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0]
      return entryDate === date
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): boolean {
    if (!this.isClient()) return false

    const entries = this.getTimeEntries()
    const entryIndex = entries.findIndex(entry => entry.id === entryId)
    
    if (entryIndex === -1) return false

    const oldEntry = entries[entryIndex]
    const updatedEntry = { ...oldEntry, ...updates }
    entries[entryIndex] = updatedEntry

    localStorage.setItem(this.KEYS.TIME_ENTRIES, JSON.stringify(entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp
    }))))

    // Recalculate work day for affected dates
    this.recalculateWorkDay(oldEntry.timestamp)
    if (updates.timestamp && new Date(updates.timestamp).toDateString() !== new Date(oldEntry.timestamp).toDateString()) {
      this.recalculateWorkDay(new Date(updates.timestamp))
    }

    return true
  }

  deleteTimeEntry(entryId: string): boolean {
    if (!this.isClient()) return false

    const entries = this.getTimeEntries()
    const entryIndex = entries.findIndex(entry => entry.id === entryId)
    
    if (entryIndex === -1) return false

    const entryToDelete = entries[entryIndex]
    entries.splice(entryIndex, 1)

    localStorage.setItem(this.KEYS.TIME_ENTRIES, JSON.stringify(entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp
    }))))

    // Recalculate work day for affected date
    this.recalculateWorkDay(entryToDelete.timestamp)

    return true
  }

  private recalculateWorkDay(timestamp: Date | string): void {
    const date = new Date(timestamp)
    const dateKey = this.formatDateKey(date)
    
    // Get all entries for this date
    const allEntries = this.getTimeEntries()
    const dayEntries = allEntries.filter(entry => {
      const entryDateKey = this.formatDateKey(new Date(entry.timestamp))
      return entryDateKey === dateKey
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Create or update work day
    const workDay: WorkDay = {
      date: dateKey,
      entries: dayEntries,
      totalWorkTime: 0,
      totalBreakTime: 0
    }

    this.calculateWorkDayTimes(workDay)

    // Save updated work day
    const workDays = this.getWorkDays()
    const existingIndex = workDays.findIndex(wd => wd.date === dateKey)
    
    if (existingIndex >= 0) {
      workDays[existingIndex] = workDay
    } else {
      workDays.push(workDay)
    }

    localStorage.setItem(this.KEYS.WORK_DAYS, JSON.stringify(workDays))
  }

  // Get all users who have time entries (for admin dropdown)
  getUsersWithTimeEntries(): Array<{userId: string, entryCount: number}> {
    const allEntries = this.getTimeEntries()
    const userMap = new Map<string, number>()

    allEntries.forEach(entry => {
      const count = userMap.get(entry.userId) || 0
      userMap.set(entry.userId, count + 1)
    })

    return Array.from(userMap.entries()).map(([userId, entryCount]) => ({
      userId,
      entryCount
    }))
  }
}

export const db = new LocalDatabase() 