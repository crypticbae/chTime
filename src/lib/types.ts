// Re-export types from database for better organization
export type { TimeEntry, WorkDay, UserSettings } from './database'

// Additional UI-specific types that might be needed
export interface User {
  id: string
  username: string
  email?: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLogin?: Date
}

export interface AdminSettings {
  registrationOpen: boolean
  allowTimestampEditing: boolean
  maxUsersLimit?: number
} 