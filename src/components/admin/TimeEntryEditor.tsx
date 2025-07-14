'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db, TimeEntry } from '@/lib/database'
import { authManager } from '@/lib/auth'
import { Edit3, X, Save, Trash2, Plus, Clock, Calendar, User } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface TimeEntryEditorProps {
  isOpen: boolean
  onClose: () => void
}

export function TimeEntryEditor({ isOpen, onClose }: TimeEntryEditorProps) {
  const { t, language } = useLanguage()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    type: 'clock-in',
    timestamp: new Date(),
    timezone: 'Europe/Berlin'
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [availableUsers, setAvailableUsers] = useState<Array<{userId: string, username: string, entryCount: number}>>([])
  const [allUsers, setAllUsers] = useState<Array<{id: string, username: string}>>([])

  // Get current user info
  const currentUser = authManager.getCurrentUser()
  const isAdmin = authManager.isCurrentUserAdmin()

  useEffect(() => {
    if (isOpen) {
      loadUsers()
      if (selectedUserId || currentUser) {
        loadTimeEntries()
      }
    }
  }, [isOpen, selectedDate, selectedUserId])

  const loadUsers = () => {
    // Get all users from localStorage - using consistent key with auth.ts
    const usersJson = localStorage.getItem('chtime-users')
    if (usersJson) {
      const users = JSON.parse(usersJson)
      setAllUsers(users.map((user: any) => ({
        id: user.id,
        username: user.username
      })))

      // Get users with time entries
      const usersWithEntries = db.getUsersWithTimeEntries()
      const enrichedUsers = usersWithEntries.map(userEntry => {
        const userInfo = users.find((u: any) => u.id === userEntry.userId)
        return {
          userId: userEntry.userId,
          username: userInfo?.username || t.unknown,
          entryCount: userEntry.entryCount
        }
      })
      setAvailableUsers(enrichedUsers)

      // Auto-select current user if no user selected
      if (!selectedUserId && currentUser) {
        setSelectedUserId(currentUser.id)
      }
    }
  }

  const loadTimeEntries = () => {
    const targetUserId = selectedUserId || currentUser?.id
    if (!targetUserId) return

    const entries = db.getTimeEntriesForUserAndDate(targetUserId, selectedDate)
    setTimeEntries(entries)
  }

  const handleSaveEdit = () => {
    if (!editingEntry) return

    try {
      const success = db.updateTimeEntry(editingEntry.id, editingEntry)
      
      if (success) {
              alert(t.entryUpdated)
      setEditingEntry(null)
      loadTimeEntries()
    } else {
      alert(t.errorNotFound)
    }
  } catch (error) {
    console.error('Error saving entry:', error)
    alert(t.errorSaving)
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    if (!confirm(t.confirmDelete)) return

    try {
      const success = db.deleteTimeEntry(entryId)
      
      if (success) {
        alert(t.entryDeleted)
        loadTimeEntries()
      } else {
        alert(t.errorNotFound)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert(t.errorDeleting)
    }
  }

  const handleAddEntry = () => {
    if (!newEntry.type || !newEntry.timestamp) return

    const targetUserId = selectedUserId || currentUser?.id
    if (!targetUserId) return

    try {
      // Use the proper database API instead of direct localStorage access
      const savedEntry = db.saveTimeEntry({
        type: newEntry.type as TimeEntry['type'],
        timestamp: new Date(newEntry.timestamp)
      }, targetUserId)

      if (savedEntry) {
        alert(t.entryAdded)
        setNewEntry({
          type: 'clock-in',
          timestamp: new Date(),
          timezone: 'Europe/Berlin'
        })
        setShowAddForm(false)
        loadTimeEntries()
      } else {
        alert(t.errorAdding)
      }
    } catch (error) {
      console.error('Error adding entry:', error)
      alert(t.errorAdding)
    }
  }

  if (!isOpen || !isAdmin) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] border-border/40 bg-card/95 backdrop-blur flex flex-col">
        <CardHeader className="border-b border-border/40 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{t.timestampEditor}</CardTitle>
                <CardDescription>
                  {t.timestampEditorDescription}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* User Selector */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.selectUser}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="user-select">{t.userForEditing}</Label>
                    <select
                      id="user-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background mt-1"
                    >
                      {currentUser && (
                        <option value={currentUser.id}>
                          {currentUser.username} ({t.me})
                        </option>
                      )}
                      {availableUsers
                        .filter(user => user.userId !== currentUser?.id)
                        .map(user => (
                          <option key={user.userId} value={user.userId}>
                            {user.username} ({user.entryCount} Einträge)
                          </option>
                        ))}
                    </select>
                  </div>
                  {selectedUserId && (
                    <div className="text-sm text-muted-foreground">
                      {t.editingTimesFor}: {availableUsers.find(u => u.userId === selectedUserId)?.username || currentUser?.username || t.unknown}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date Selector */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.selectDate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="date-select">{t.dateForEditing}</Label>
                    <Input
                      id="date-select"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="mt-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addEntry}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add New Entry Form */}
            {showAddForm && (
              <Card className="border-border/40 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">{t.addNewEntry}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>{t.type}</Label>
                      <select
                        value={newEntry.type}
                        onChange={(e) => setNewEntry({...newEntry, type: e.target.value as TimeEntry['type']})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="clock-in">{t.entryTypes['clock-in']}</option>
                        <option value="clock-out">{t.entryTypes['clock-out']}</option>
                        <option value="break-start">{t.entryTypes['break-start']}</option>
                        <option value="break-end">{t.entryTypes['break-end']}</option>
                      </select>
                    </div>
                    <div>
                      <Label>{t.currentDate}</Label>
                      <Input
                        type="date"
                        value={new Date(newEntry.timestamp!).toISOString().split('T')[0]}
                        onChange={(e) => {
                          const time = new Date(newEntry.timestamp!).toTimeString().split(' ')[0]
                          setNewEntry({...newEntry, timestamp: new Date(`${e.target.value}T${time}`)})
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t.time}</Label>
                      <Input
                        type="time"
                        value={new Date(newEntry.timestamp!).toTimeString().split(' ')[0].slice(0, 5)}
                        onChange={(e) => {
                          const date = new Date(newEntry.timestamp!).toISOString().split('T')[0]
                          setNewEntry({...newEntry, timestamp: new Date(`${date}T${e.target.value}:00`)})
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddEntry}>
                      <Save className="h-4 w-4 mr-2" />
                      {t.addEntry}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      {t.cancel}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Entries List */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t.entries} {new Date(selectedDate).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.pdfNoEntries}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 border border-border/40 rounded-lg"
                      >
                        {editingEntry?.id === entry.id ? (
                          // Edit Mode
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <select
                              value={editingEntry.type}
                              onChange={(e) => setEditingEntry({
                                ...editingEntry,
                                type: e.target.value as TimeEntry['type']
                              })}
                              className="px-3 py-1 border border-border rounded bg-background"
                            >
                              <option value="clock-in">{t.entryTypes['clock-in']}</option>
                              <option value="clock-out">{t.entryTypes['clock-out']}</option>
                              <option value="break-start">{t.entryTypes['break-start']}</option>
                              <option value="break-end">{t.entryTypes['break-end']}</option>
                            </select>
                            <Input
                              type="date"
                              value={new Date(editingEntry.timestamp).toISOString().split('T')[0]}
                              onChange={(e) => {
                                const time = new Date(editingEntry.timestamp).toTimeString().split(' ')[0]
                                setEditingEntry({
                                  ...editingEntry,
                                  timestamp: new Date(`${e.target.value}T${time}`)
                                })
                              }}
                            />
                            <Input
                              type="time"
                              value={new Date(editingEntry.timestamp).toTimeString().split(' ')[0].slice(0, 5)}
                              onChange={(e) => {
                                const date = new Date(editingEntry.timestamp).toISOString().split('T')[0]
                                setEditingEntry({
                                  ...editingEntry,
                                  timestamp: new Date(`${date}T${e.target.value}:00`)
                                })
                              }}
                            />
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="font-medium">
                                {entry.type === 'clock-in' && t.entryTypes['clock-in']}
                                {entry.type === 'clock-out' && t.entryTypes['clock-out']}
                                {entry.type === 'break-start' && t.entryTypes['break-start']}
                                {entry.type === 'break-end' && t.entryTypes['break-end']}
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {editingEntry?.id === entry.id ? (
                            <>
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingEntry(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingEntry(entry)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 