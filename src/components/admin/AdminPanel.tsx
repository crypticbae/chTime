'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { authManager } from '@/lib/auth'
import { db } from '@/lib/database'
import { Settings, Users, Shield, Clock, Check, X, Edit3 } from 'lucide-react'
import { TimeEntryEditor } from './TimeEntryEditor'
import { useLanguage } from '@/contexts/LanguageContext'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { t, language } = useLanguage()
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [showTimeEntryEditor, setShowTimeEntryEditor] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadAdminData()
    }
  }, [isOpen])

  const loadAdminData = () => {
    setIsLoading(true)
    
    // Load registration status
    const systemSettings = authManager.getSystemSettings()
    setRegistrationEnabled(systemSettings.registrationEnabled)
    
    // Load users (mock data for now since we don't have a getUsers method exposed)
    const currentUser = authManager.getCurrentUser()
    if (currentUser) {
      setUsers([currentUser])
    }
    
    setIsLoading(false)
  }

  const handleRegistrationToggle = (enabled: boolean) => {
    const success = authManager.updateSystemSettings({ registrationEnabled: enabled })
    if (success) {
      setRegistrationEnabled(enabled)
    } else {
      alert(t.errorUpdatingSettings)
    }
  }

  const currentUser = authManager.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  if (!isOpen || !isAdmin) return null

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] border-border/40 bg-card/95 backdrop-blur flex flex-col">
          <CardHeader className="border-b border-border/40 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{t.adminTitle}</CardTitle>
                  <CardDescription>
                    {t.adminDescription}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Status */}
                <Card className="border-border/40 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      {t.adminStatusTitle}
                    </CardTitle>
                    <CardDescription>
                      {t.adminStatusDescription}: <strong>{currentUser?.username}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{t.adminFunctionsAvailable}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Control */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t.adminRegistrationTitle}
                    </CardTitle>
                    <CardDescription>
                      {t.adminRegistrationDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="registration-toggle" className="text-sm font-medium">
                          {t.adminAllowNewRegistrations}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {registrationEnabled 
                            ? t.adminRegistrationEnabledText 
                            : t.adminRegistrationDisabledText}
                        </p>
                      </div>
                      <Switch
                        id="registration-toggle"
                        checked={registrationEnabled}
                        onCheckedChange={handleRegistrationToggle}
                      />
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${
                      registrationEnabled 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                        : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2 text-sm">
                        {registrationEnabled ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 dark:text-green-200 font-medium">
                              {t.adminRegistrationEnabled}
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-600" />
                            <span className="text-red-800 dark:text-red-200 font-medium">
                              {t.adminRegistrationDisabled}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Entry Management */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t.adminTimeManagementTitle}
                    </CardTitle>
                    <CardDescription>
                      {t.adminTimeManagementDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-border/40 rounded-lg bg-muted/20">
                        <h4 className="font-medium mb-2">{t.adminTimeManagementFunctionsTitle}</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• {t.adminEditAllUsers}</li>
                          <li>• {t.adminRetroactiveCorrections}</li>
                          <li>• {t.adminManualAdjustments}</li>
                          <li>• {t.adminAddMissingEntries}</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={() => setShowTimeEntryEditor(true)}
                        className="w-full"
                        variant="outline"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {t.adminOpenEditor}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {t.adminSystemInfoTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">{t.adminLoggedInUser}</Label>
                        <p className="font-medium">{currentUser?.username}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t.adminRole}</Label>
                        <p className="font-medium flex items-center gap-1">
                          <Shield className="h-3 w-3 text-red-600" />
                          {t.adminAdministrator}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t.adminEmail}</Label>
                        <p className="font-medium">{currentUser?.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t.adminCreatedAt}</Label>
                        <p className="font-medium">
                          {currentUser?.createdAt?.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Entry Editor Modal */}
      <TimeEntryEditor
        isOpen={showTimeEntryEditor}
        onClose={() => setShowTimeEntryEditor(false)}
      />
    </>
  )
} 