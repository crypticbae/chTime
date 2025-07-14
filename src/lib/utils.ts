import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TimeEntry, WorkDay } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate work day statistics from time entries
export function calculateWorkDay(entries: TimeEntry[]): WorkDay {
  const date = entries.length > 0 ? 
    new Date(entries[0].timestamp).toISOString().split('T')[0] :
    new Date().toISOString().split('T')[0]

  let totalWorkTime = 0
  let totalBreakTime = 0
  let clockInTime: Date | null = null
  let breakStartTime: Date | null = null

  entries.forEach(entry => {
    const timestamp = new Date(entry.timestamp)
    
    switch (entry.type) {
      case 'clock-in':
        clockInTime = timestamp
        break
      case 'clock-out':
        if (clockInTime) {
          totalWorkTime += timestamp.getTime() - clockInTime.getTime()
          clockInTime = null
        }
        break
      case 'break-start':
        breakStartTime = timestamp
        break
      case 'break-end':
        if (breakStartTime) {
          totalBreakTime += timestamp.getTime() - breakStartTime.getTime()
          breakStartTime = null
        }
        break
    }
  })

  // Convert from milliseconds to minutes
  totalWorkTime = Math.floor(totalWorkTime / (1000 * 60))
  totalBreakTime = Math.floor(totalBreakTime / (1000 * 60))

  return {
    date,
    entries: entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    totalWorkTime,
    totalBreakTime
  }
}

// Format duration in minutes to readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Format time to HH:MM
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

// Get date range for filtering
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
} 