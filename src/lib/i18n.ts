export type Language = 'de' | 'en'

export interface Translations {
  // App General
  appName: string
  appDescription: string
  
  // Header
  timeTracking: string
  overview: string
  settings: string
  adminPanel: string
  logout: string
  adminBadge: string
  
  // Status
  notWorking: string
  working: string
  onBreak: string
  today: string
  
  // Actions
  clockIn: string
  clockOut: string
  startBreak: string
  endBreak: string
  
  // Time Display
  currentTime: string
  currentDate: string
  workTime: string
  breakTime: string
  
  // Admin
  adminSetupRequired: string
  adminSetupDescription: string
  makeAdmin: string
  editTimestamps: string
  registrationControl: string
  systemInformation: string
  registrationOpen: string
  registrationClosed: string
  openRegistration: string
  closeRegistration: string
  
  // Admin Panel
  adminTitle: string
  adminDescription: string
  adminStatusTitle: string
  adminStatusDescription: string
  adminFunctionsAvailable: string
  adminRegistrationTitle: string
  adminRegistrationDescription: string
  adminAllowNewRegistrations: string
  adminRegistrationEnabledText: string
  adminRegistrationDisabledText: string
  adminRegistrationEnabled: string
  adminRegistrationDisabled: string
  adminTimeManagementTitle: string
  adminTimeManagementDescription: string
  adminTimeManagementFunctionsTitle: string
  adminEditAllUsers: string
  adminRetroactiveCorrections: string
  adminManualAdjustments: string
  adminAddMissingEntries: string
  adminOpenEditor: string
  adminSystemInfoTitle: string
  adminLoggedInUser: string
  adminRole: string
  adminAdministrator: string
  adminEmail: string
  adminCreatedAt: string
  
  // Time Editor
  timestampEditor: string
  timestampEditorDescription: string
  selectUser: string
  selectDate: string
  userForEditing: string
  dateForEditing: string
  me: string
  editingTimesFor: string
  unknown: string
  addEntry: string
  addNewEntry: string
  type: string
  time: string
  timezone: string
  save: string
  cancel: string
  edit: string
  delete: string
  close: string
  
  // Entry Types
  entryTypes: {
    'clock-in': string
    'clock-out': string
    'break-start': string
    'break-end': string
  }
  
  // Messages
  confirmDelete: string
  confirmDeleteAll: string
  confirmLoadDemo: string
  entryUpdated: string
  entryDeleted: string
  entryAdded: string
  errorSaving: string
  errorDeleting: string
  errorAdding: string
  errorNotFound: string
  errorNotLoggedIn: string
  demoDataLoaded: string
  allDataDeleted: string
  invalidDate: string
  
  // Settings
  timezoneSettings: string
  selectTimezone: string
  workHoursTarget: string
  theme: string
  light: string
  dark: string
  
  // Summary
  workSummary: string
  dailySummary: string
  selectDateRange: string
  startDate: string
  endDate: string
  generatePDF: string
  totalWorkDays: string
  totalWorkTime: string
  totalBreakTime: string
  averageWorkTime: string
  
  // PDF
  pdfTitle: string
  pdfSubtitle: string
  pdfGeneratedOn: string
  pdfPeriod: string
  pdfSummary: string
  pdfDetailedEntries: string
  pdfDate: string
  pdfEntries: string
  pdfWorkTime: string
  pdfBreakTime: string
  pdfNoEntries: string
  
  // PDF Reports
  pdfDayReportTitle: string
  pdfRangeReportTitle: string
  pdfTargetTime: string
  pdfTimeActivities: string
  pdfTime: string
  pdfWorkStart: string
  pdfWorkEnd: string
  pdfNoTimeEntriesFound: string
  pdfTotalWorkTime: string
  pdfTotalBreakTime: string
  pdfWorkDays: string
  pdfAveragePerWorkDay: string
  pdfDailyBreakdown: string
  pdfNoWorkTimesFound: string
  pdfProgress: string
  pdfActivity: string
  pdfStatus: string
  
  // Demo
  loadDemo: string
  clearData: string
  
  // Auth
  noUsers: string
  registrationDisabled: string
  userAlreadyAdmin: string
  userMadeAdmin: string
  userNotFound: string
  
  // Auth Page
  professionalTimeTracking: string
  welcomeFirstAccount: string
  yourTimePerfectlyCaptured: string
  confirmPasswordLabel: string
  yourUsernameLabel: string
  errorUpdatingSettings: string
  registrationCurrentlyDisabled: string
  welcomeBack: string
  
  // Confirm dialogs
  confirmLogout: string
  
  // Progress
  workTimeProgress: string
  
  // Time and date
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  thisMonth: string
  lastMonth: string
  
  // Summary page
  progressToTarget: string
  targetReached: string
  activitiesOfDay: string
  weekOverview: string
  last7DaysOverview: string
  totalThisWeek: string
  dailyAverage: string
  noActivitiesForDay: string
  noActivitiesToday: string
  last7Days: string
  last30Days: string
  totalBreaks: string
  workingDays: string
  chronologicalOverview: string
  dailyOverview: string
  lastActivity: string
  latestActivities: string
  yourLatestTimestamps: string
  previousDay: string
  averagePerWorkDay: string
  averagePerDay: string
  days: string
  
  // Auth forms
  signInToAccount: string
  password: string
  yourPassword: string
  signingIn: string
  signIn: string
  noAccountYet: string
  registerNow: string
  emailAddress: string
  yourEmail: string
  passwordStrength: string
  repeatPassword: string
  creatingAccount: string
  createAccount: string
  alreadyHaveAccount: string
  signInNow: string
  
  // Settings
  dailyWorkTarget: string
  
  // Entry types
  clockedIn: string
  clockedOut: string
  breakStarted: string
  breakEnded: string
  
  // Numbers
  entries: string
  minutes: string
  hours: string
}

const germanTranslations: Translations = {
  // App General
  appName: 'chTime',
  appDescription: 'Zeiterfassung',
  
  // Header
  timeTracking: 'Zeiterfassung',
  overview: 'Übersicht',
  settings: 'Einstellungen',
  adminPanel: 'Admin-Panel',
  logout: 'Abmelden',
  adminBadge: 'Admin',
  
  // Status
  notWorking: 'Nicht am Arbeiten',
  working: 'Am Arbeiten',
  onBreak: 'In der Pause',
  today: 'Heute',
  
  // Actions
  clockIn: 'Einstempeln',
  clockOut: 'Ausstempeln',
  startBreak: 'Pause starten',
  endBreak: 'Pause beenden',
  
  // Time Display
  currentTime: 'Aktuelle Zeit',
  currentDate: 'Aktuelles Datum',
  workTime: 'Arbeitszeit',
  breakTime: 'Pausenzeit',
  
  // Admin
  adminSetupRequired: 'Admin-Setup erforderlich',
  adminSetupDescription: 'Dein Konto zum Admin machen, um Systemeinstellungen zu verwalten',
  makeAdmin: 'Zum Admin machen',
  editTimestamps: 'Zeitstempel bearbeiten',
  registrationControl: 'Registrierung verwalten',
  systemInformation: 'System-Information',
  registrationOpen: 'Registrierung ist geöffnet',
  registrationClosed: 'Registrierung ist geschlossen',
  openRegistration: 'Registrierung öffnen',
  closeRegistration: 'Registrierung schließen',
  
  // Admin Panel
  adminTitle: 'Admin-Panel',
  adminDescription: 'Systemverwaltung und erweiterte Einstellungen',
  adminStatusTitle: 'Administrator-Status',
  adminStatusDescription: 'Sie sind als Administrator angemeldet',
  adminFunctionsAvailable: 'Alle Admin-Funktionen verfügbar',
  adminRegistrationTitle: 'Registrierungssteuerung',
  adminRegistrationDescription: 'Kontrolle über neue Benutzerregistrierungen',
  adminAllowNewRegistrations: 'Neue Registrierungen zulassen',
  adminRegistrationEnabledText: 'Neue Benutzer können sich registrieren',
  adminRegistrationDisabledText: 'Registrierung ist gesperrt - nur bestehende Benutzer können sich anmelden',
  adminRegistrationEnabled: 'Registrierung aktiviert',
  adminRegistrationDisabled: 'Registrierung deaktiviert',
  adminTimeManagementTitle: 'Zeitstempel-Verwaltung',
  adminTimeManagementDescription: 'Bearbeitung und Verwaltung von Arbeitszeiten',
  adminTimeManagementFunctionsTitle: 'Admin-Funktionen für Zeiterfassung',
  adminEditAllUsers: 'Zeitstempel aller Benutzer bearbeiten',
  adminRetroactiveCorrections: 'Nachträgliche Korrekturen vornehmen',
  adminManualAdjustments: 'Arbeitszeiten manuell anpassen',
  adminAddMissingEntries: 'Fehlende Einträge hinzufügen',
  adminOpenEditor: 'Zeitstempel-Editor öffnen',
  adminSystemInfoTitle: 'System-Information',
  adminLoggedInUser: 'Angemeldeter Benutzer',
  adminRole: 'Rolle',
  adminAdministrator: 'Administrator',
  adminEmail: 'E-Mail',
  adminCreatedAt: 'Erstellt am',
  
  // Time Editor
  timestampEditor: 'Zeitstempel-Editor',
  timestampEditorDescription: 'Bearbeitung und Verwaltung von Arbeitszeiten',
  selectUser: 'Benutzer auswählen',
  selectDate: 'Datum auswählen',
  userForEditing: 'Benutzer für Zeitbearbeitung',
  dateForEditing: 'Datum für Bearbeitung',
  me: 'Ich',
  editingTimesFor: 'Bearbeite Zeiten von',
  unknown: 'Unbekannt',
  addEntry: 'Eintrag hinzufügen',
  addNewEntry: 'Neuen Eintrag hinzufügen',
  type: 'Typ',
  time: 'Zeit',
  timezone: 'Zeitzone',
  save: 'Speichern',
  cancel: 'Abbrechen',
  edit: 'Bearbeiten',
  delete: 'Löschen',
  close: 'Schließen',
  
  // Entry Types
  entryTypes: {
    'clock-in': 'Arbeitsbeginn',
    'clock-out': 'Arbeitsende',
    'break-start': 'Pausenbeginn',
    'break-end': 'Pausenende'
  },
  
  // Messages
  confirmDelete: 'Möchten Sie diesen Eintrag wirklich löschen?',
  confirmDeleteAll: 'Möchten Sie alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
  confirmLoadDemo: 'Möchten Sie Demo-Daten vom 01.01.2025 bis heute laden? Dies überschreibt alle vorhandenen Daten.',
  entryUpdated: 'Eintrag erfolgreich aktualisiert!',
  entryDeleted: 'Eintrag erfolgreich gelöscht!',
  entryAdded: 'Eintrag erfolgreich hinzugefügt!',
  errorSaving: 'Fehler beim Speichern des Eintrags',
  errorDeleting: 'Fehler beim Löschen des Eintrags',
  errorAdding: 'Fehler beim Hinzufügen des Eintrags',
  errorNotFound: 'Fehler: Eintrag nicht gefunden',
  errorNotLoggedIn: 'Fehler: Benutzer nicht eingeloggt',
  demoDataLoaded: 'Demo-Daten erfolgreich geladen!',
  allDataDeleted: 'Alle Daten gelöscht!',
  invalidDate: 'Ungültiges Datum',
  
  // Settings
  timezoneSettings: 'Zeitzone-Einstellungen',
  selectTimezone: 'Zeitzone auswählen',
  workHoursTarget: 'Arbeitsstunden-Ziel',
  theme: 'Design',
  light: 'Hell',
  dark: 'Dunkel',
  
  // Summary
  workSummary: 'Arbeitsübersicht',
  dailySummary: 'Tagesübersicht',
  selectDateRange: 'Datumsbereich auswählen',
  startDate: 'Startdatum',
  endDate: 'Enddatum',
  generatePDF: 'PDF erstellen',
  totalWorkDays: 'Gesamte Arbeitstage',
  totalWorkTime: 'Gesamte Arbeitszeit',
  totalBreakTime: 'Gesamte Pausenzeit',
  averageWorkTime: 'Durchschnittliche Arbeitszeit',
  
  // PDF
  pdfTitle: 'Arbeitszeit-Bericht',
  pdfSubtitle: 'Detaillierte Übersicht der Arbeitszeiten',
  pdfGeneratedOn: 'Erstellt am',
  pdfPeriod: 'Zeitraum',
  pdfSummary: 'Zusammenfassung',
  pdfDetailedEntries: 'Detaillierte Einträge',
  pdfDate: 'Datum',
  pdfEntries: 'Einträge',
  pdfWorkTime: 'Arbeitszeit',
  pdfBreakTime: 'Pausenzeit',
  pdfNoEntries: 'Keine Einträge für diesen Tag',
  
  // PDF Reports
  pdfDayReportTitle: 'chTime Tagesbericht',
  pdfRangeReportTitle: 'chTime Zeitspannen-Bericht',
  pdfTargetTime: 'Zielzeit',
  pdfTimeActivities: '[ZEIT] AKTIVITÄTEN',
  pdfTime: 'Zeit',
  pdfWorkStart: 'Arbeitsbeginn',
  pdfWorkEnd: 'Arbeitsende',
  pdfNoTimeEntriesFound: 'Für diesen Tag wurden keine Zeiterfassungen gefunden.',
  pdfTotalWorkTime: 'Gesamtarbeitszeit',
  pdfTotalBreakTime: 'Gesamtpausenzeit',
  pdfWorkDays: 'Arbeitstage',
  pdfAveragePerWorkDay: 'Ø pro Arbeitstag',
  pdfDailyBreakdown: '[ÜBERSICHT] TÄGLICHE AUFSCHLÜSSELUNG',
  pdfNoWorkTimesFound: 'Für den gewählten Zeitraum wurden keine Arbeitszeiten gefunden.',
  pdfProgress: 'Fortschritt',
  pdfActivity: 'Aktivität',
  pdfStatus: 'Status',
  
  // Demo
  loadDemo: 'Demo',
  clearData: 'Clear',
  
  // Auth
  noUsers: 'Keine Benutzer gefunden',
  registrationDisabled: 'Registrierung ist deaktiviert',
  userAlreadyAdmin: 'ist bereits Admin',
  userMadeAdmin: 'wurde erfolgreich zum Admin gemacht',
  userNotFound: 'nicht gefunden',
  
  // Auth Page
  professionalTimeTracking: 'Professionelle Arbeitszeiterfassung',
  welcomeFirstAccount: '🎉 Willkommen! Erstellen Sie Ihr erstes Konto',
  yourTimePerfectlyCaptured: '© 2025 chTime. Ihre Zeit, perfekt erfasst.',
  confirmPasswordLabel: 'Passwort bestätigen',
  yourUsernameLabel: 'Ihr Benutzername',
  errorUpdatingSettings: 'Fehler beim Aktualisieren der Einstellungen',
  registrationCurrentlyDisabled: 'Registrierung ist derzeit deaktiviert. Kontaktieren Sie einen Administrator.',
  welcomeBack: 'Willkommen zurück',
  
  // Confirm dialogs
  confirmLogout: 'Möchten Sie sich wirklich abmelden?',
  
  // Progress
  workTimeProgress: 'Arbeitszeit-Fortschritt',
  
  // Time and date
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
  thisMonth: 'Dieser Monat',
  lastMonth: 'Letzter Monat',
  
  // Summary page
  progressToTarget: 'Fortschritt zum Tagesziel',
  targetReached: '🎉 Tagesziel erreicht!',
  activitiesOfDay: 'Aktivitäten des Tages',
  weekOverview: 'Wochenübersicht',
  last7DaysOverview: 'Letzte 7 Tage im Überblick',
  totalThisWeek: 'Gesamt diese Woche',
  dailyAverage: 'Tagesdurchschnitt',
  noActivitiesForDay: 'Keine Aktivitäten für diesen Tag',
  noActivitiesToday: 'Noch keine Aktivitäten heute',
  last7Days: 'Letzte 7 Tage',
  last30Days: 'Letzte 30 Tage',
  totalBreaks: 'Gesamtpausen',
  workingDays: 'Arbeitstage',
  chronologicalOverview: 'Chronologische Übersicht aller Stempelungen',
  dailyOverview: 'Tägliche Übersicht',
  lastActivity: 'Letzte Aktivität',
  latestActivities: 'Letzte Aktivitäten',
  yourLatestTimestamps: 'Ihre neuesten Zeitstempelungen',
  previousDay: 'Vorheriger Tag',
  averagePerWorkDay: 'Ø pro Arbeitstag',
  averagePerDay: 'Ø pro Tag',
  days: 'Tage',
  
  // Auth forms
  signInToAccount: 'Melden Sie sich in Ihrem chTime-Konto an',
  password: 'Passwort',
  yourPassword: 'Ihr Passwort',
  signingIn: 'Anmeldung läuft...',
  signIn: 'Anmelden',
  noAccountYet: 'Noch kein Konto?',
  registerNow: 'Jetzt registrieren',
  emailAddress: 'E-Mail-Adresse',
  yourEmail: 'ihre@email.de',
  passwordStrength: 'Passwort-Stärke',
  repeatPassword: 'Passwort wiederholen',
  creatingAccount: 'Konto wird erstellt...',
  createAccount: 'Konto erstellen',
  alreadyHaveAccount: 'Bereits ein Konto vorhanden?',
  signInNow: 'Jetzt anmelden',
  
  // Settings
  dailyWorkTarget: 'Tägliches Arbeitsziel',
  
  // Entry types
  clockedIn: 'Eingestempelt',
  clockedOut: 'Ausgestempelt',
  breakStarted: 'Pause begonnen',
  breakEnded: 'Pause beendet',
  
  // Numbers
  entries: 'Einträge',
  minutes: 'Minuten',
  hours: 'Stunden'
}

const englishTranslations: Translations = {
  // App General
  appName: 'chTime',
  appDescription: 'Time Tracking',
  
  // Header
  timeTracking: 'Time Tracking',
  overview: 'Overview',
  settings: 'Settings',
  adminPanel: 'Admin Panel',
  logout: 'Logout',
  adminBadge: 'Admin',
  
  // Status
  notWorking: 'Not Working',
  working: 'Working',
  onBreak: 'On Break',
  today: 'Today',
  
  // Actions
  clockIn: 'Clock In',
  clockOut: 'Clock Out',
  startBreak: 'Start Break',
  endBreak: 'End Break',
  
  // Time Display
  currentTime: 'Current Time',
  currentDate: 'Current Date',
  workTime: 'Work Time',
  breakTime: 'Break Time',
  
  // Admin
  adminSetupRequired: 'Admin Setup Required',
  adminSetupDescription: 'Make your account admin to manage system settings',
  makeAdmin: 'Make Admin',
  editTimestamps: 'Edit Timestamps',
  registrationControl: 'Registration Control',
  systemInformation: 'System Information',
  registrationOpen: 'Registration is open',
  registrationClosed: 'Registration is closed',
  openRegistration: 'Open Registration',
  closeRegistration: 'Close Registration',
  
  // Admin Panel
  adminTitle: 'Admin Panel',
  adminDescription: 'System management and advanced settings',
  adminStatusTitle: 'Administrator Status',
  adminStatusDescription: 'You are logged in as administrator',
  adminFunctionsAvailable: 'All admin functions available',
  adminRegistrationTitle: 'Registration Control',
  adminRegistrationDescription: 'Control over new user registrations',
  adminAllowNewRegistrations: 'Allow new registrations',
  adminRegistrationEnabledText: 'New users can register',
  adminRegistrationDisabledText: 'Registration is locked - only existing users can log in',
  adminRegistrationEnabled: 'Registration enabled',
  adminRegistrationDisabled: 'Registration disabled',
  adminTimeManagementTitle: 'Timestamp Management',
  adminTimeManagementDescription: 'Editing and management of work times',
  adminTimeManagementFunctionsTitle: 'Admin functions for time tracking',
  adminEditAllUsers: 'Edit timestamps of all users',
  adminRetroactiveCorrections: 'Make retrospective corrections',
  adminManualAdjustments: 'Manually adjust work times',
  adminAddMissingEntries: 'Add missing entries',
  adminOpenEditor: 'Open timestamp editor',
  adminSystemInfoTitle: 'System Information',
  adminLoggedInUser: 'Logged in user',
  adminRole: 'Role',
  adminAdministrator: 'Administrator',
  adminEmail: 'Email',
  adminCreatedAt: 'Created on',
  
  // Time Editor
  timestampEditor: 'Timestamp Editor',
  timestampEditorDescription: 'Edit and manage work times',
  selectUser: 'Select User',
  selectDate: 'Select Date',
  userForEditing: 'User for time editing',
  dateForEditing: 'Date for editing',
  me: 'Me',
  editingTimesFor: 'Editing times for',
  unknown: 'Unknown',
  addEntry: 'Add Entry',
  addNewEntry: 'Add New Entry',
  type: 'Type',
  time: 'Time',
  timezone: 'Timezone',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  close: 'Close',
  
  // Entry Types
  entryTypes: {
    'clock-in': 'Clock In',
    'clock-out': 'Clock Out',
    'break-start': 'Break Start',
    'break-end': 'Break End'
  },
  
  // Messages
  confirmDelete: 'Do you really want to delete this entry?',
  confirmDeleteAll: 'Do you want to delete all data? This action cannot be undone.',
  confirmLoadDemo: 'Do you want to load demo data from 01.01.2025 to today? This will overwrite all existing data.',
  entryUpdated: 'Entry successfully updated!',
  entryDeleted: 'Entry successfully deleted!',
  entryAdded: 'Entry successfully added!',
  errorSaving: 'Error saving entry',
  errorDeleting: 'Error deleting entry',
  errorAdding: 'Error adding entry',
  errorNotFound: 'Error: Entry not found',
  errorNotLoggedIn: 'Error: User not logged in',
  demoDataLoaded: 'Demo data successfully loaded!',
  allDataDeleted: 'All data deleted!',
  invalidDate: 'Invalid Date',
  
  // Settings
  timezoneSettings: 'Timezone Settings',
  selectTimezone: 'Select Timezone',
  workHoursTarget: 'Work Hours Target',
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  
  // Summary
  workSummary: 'Work Summary',
  dailySummary: 'Daily Summary',
  selectDateRange: 'Select Date Range',
  startDate: 'Start Date',
  endDate: 'End Date',
  generatePDF: 'Generate PDF',
  totalWorkDays: 'Total Work Days',
  totalWorkTime: 'Total Work Time',
  totalBreakTime: 'Total Break Time',
  averageWorkTime: 'Average Work Time',
  
  // PDF
  pdfTitle: 'Work Time Report',
  pdfSubtitle: 'Detailed overview of work times',
  pdfGeneratedOn: 'Generated on',
  pdfPeriod: 'Period',
  pdfSummary: 'Summary',
  pdfDetailedEntries: 'Detailed Entries',
  pdfDate: 'Date',
  pdfEntries: 'Entries',
  pdfWorkTime: 'Work Time',
  pdfBreakTime: 'Break Time',
  pdfNoEntries: 'No entries for this day',
  
  // PDF Reports
  pdfDayReportTitle: 'chTime Daily Report',
  pdfRangeReportTitle: 'chTime Time Range Report',
  pdfTargetTime: 'Target Time',
  pdfTimeActivities: '[TIME] ACTIVITIES',
  pdfTime: 'Time',
  pdfWorkStart: 'Work Start',
  pdfWorkEnd: 'Work End',
  pdfNoTimeEntriesFound: 'No time entries found for this day.',
  pdfTotalWorkTime: 'Total Work Time',
  pdfTotalBreakTime: 'Total Break Time',
  pdfWorkDays: 'Work Days',
  pdfAveragePerWorkDay: 'Avg per work day',
  pdfDailyBreakdown: '[OVERVIEW] DAILY BREAKDOWN',
  pdfNoWorkTimesFound: 'No work times found for the selected period.',
  pdfProgress: 'Progress',
  pdfActivity: 'Activity',
  pdfStatus: 'Status',
  
  // Demo
  loadDemo: 'Demo',
  clearData: 'Clear',
  
  // Auth
  noUsers: 'No users found',
  registrationDisabled: 'Registration is disabled',
  userAlreadyAdmin: 'is already admin',
  userMadeAdmin: 'was successfully made admin',
  userNotFound: 'not found',
  
  // Auth Page
  professionalTimeTracking: 'Professional time tracking',
  welcomeFirstAccount: '🎉 Welcome! Create your first account',
  yourTimePerfectlyCaptured: '© 2025 chTime. Your time, perfectly captured.',
  confirmPasswordLabel: 'Confirm password',
  yourUsernameLabel: 'Your username',
  errorUpdatingSettings: 'Error updating settings',
  registrationCurrentlyDisabled: 'Registration is currently disabled. Contact an administrator.',
  welcomeBack: 'Welcome back',
  
  // Confirm dialogs
  confirmLogout: 'Do you really want to log out?',
  
  // Progress
  workTimeProgress: 'Work Time Progress',
  
  // Time and date
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  
  // Summary page
  progressToTarget: 'Progress to target',
  targetReached: '🎉 Target reached!',
  activitiesOfDay: 'Activities of the day',
  weekOverview: 'Week Overview',
  last7DaysOverview: 'Last 7 days overview',
  totalThisWeek: 'Total this week',
  dailyAverage: 'Daily average',
  noActivitiesForDay: 'No activities for this day',
  noActivitiesToday: 'No activities today yet',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  totalBreaks: 'Total breaks',
  workingDays: 'Working days',
  chronologicalOverview: 'Chronological overview of all timestamps',
  dailyOverview: 'Daily overview',
  lastActivity: 'Last activity',
  latestActivities: 'Latest activities',
  yourLatestTimestamps: 'Your latest timestamps',
  previousDay: 'Previous day',
  averagePerWorkDay: 'Avg per work day',
  averagePerDay: 'Avg per day',
  days: 'days',
  
  // Auth forms
  signInToAccount: 'Sign in to your chTime account',
  password: 'Password',
  yourPassword: 'Your password',
  signingIn: 'Signing in...',
  signIn: 'Sign in',
  noAccountYet: 'No account yet?',
  registerNow: 'Register now',
  emailAddress: 'Email address',
  yourEmail: 'your@email.com',
  passwordStrength: 'Password strength',
  repeatPassword: 'Repeat password',
  creatingAccount: 'Creating account...',
  createAccount: 'Create account',
  alreadyHaveAccount: 'Already have an account?',
  signInNow: 'Sign in now',
  
  // Settings
  dailyWorkTarget: 'Daily work target',
  
  // Entry types
  clockedIn: 'Clocked in',
  clockedOut: 'Clocked out',
  breakStarted: 'Break started',
  breakEnded: 'Break ended',
  
  // Numbers
  entries: 'entries',
  minutes: 'minutes',
  hours: 'hours'
}

export const translations = {
  de: germanTranslations,
  en: englishTranslations
}

export function getTranslations(language: Language): Translations {
  return translations[language]
} 