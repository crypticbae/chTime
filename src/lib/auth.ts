export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  salt: string
  role: 'admin' | 'user'
  createdAt: Date
  lastLogin?: Date
}

export interface AuthSession {
  userId: string
  token: string
  createdAt: Date
  expiresAt: Date
}

export interface SystemSettings {
  registrationEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export class AuthManager {
  private readonly KEYS = {
    USERS: 'chtime-users',
    CURRENT_SESSION: 'chtime-session',
    CURRENT_USER: 'chtime-current-user',
    SYSTEM_SETTINGS: 'chtime-system-settings'
  }

  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  // Generate cryptographically secure random bytes
  private generateRandomBytes(length: number): Uint8Array {
    if (!this.isClient()) {
      throw new Error('Crypto operations only available on client')
    }
    return crypto.getRandomValues(new Uint8Array(length))
  }

  // Convert bytes to hex string
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Convert hex string to bytes
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  // Hash password with salt using PBKDF2
  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    if (!this.isClient()) {
      throw new Error('Crypto operations only available on client')
    }

    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 32 bytes
    )

    return this.bytesToHex(new Uint8Array(derivedBits))
  }

  // Verify password against hash
  private async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const saltBytes = this.hexToBytes(salt)
      const computedHash = await this.hashPassword(password, saltBytes)
      return computedHash === hash
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  // Generate session token
  private generateSessionToken(): string {
    const randomBytes = this.generateRandomBytes(32)
    return this.bytesToHex(randomBytes)
  }

  // Get all users
  private getUsers(): User[] {
    if (!this.isClient()) return []
    
    const saved = localStorage.getItem(this.KEYS.USERS)
    if (!saved) return []

    try {
      const users = JSON.parse(saved)
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }))
    } catch (error) {
      console.error('Error loading users:', error)
      return []
    }
  }

  // Save users
  private saveUsers(users: User[]): void {
    if (!this.isClient()) return
    
    const serializedUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString()
    }))
    
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(serializedUsers))
  }

  // Check if any users exist (for first-time setup)
  hasUsers(): boolean {
    return this.getUsers().length > 0
  }

  // Check if registration is enabled
  isRegistrationEnabled(): boolean {
    const settings = this.getSystemSettings()
    return settings.registrationEnabled
  }

  // Get system settings
  getSystemSettings(): SystemSettings {
    if (!this.isClient()) {
      return { registrationEnabled: true, createdAt: new Date(), updatedAt: new Date() }
    }

    const saved = localStorage.getItem(this.KEYS.SYSTEM_SETTINGS)
    if (!saved) {
      // Default settings
      const defaultSettings: SystemSettings = {
        registrationEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
             localStorage.setItem(this.KEYS.SYSTEM_SETTINGS, JSON.stringify({
         ...defaultSettings,
         createdAt: defaultSettings.createdAt.toISOString(),
         updatedAt: defaultSettings.updatedAt.toISOString()
       }))
       return defaultSettings
    }

    try {
      const settings = JSON.parse(saved)
      return {
        ...settings,
        createdAt: new Date(settings.createdAt),
        updatedAt: new Date(settings.updatedAt)
      }
    } catch (error) {
      console.error('Error loading system settings:', error)
      return { registrationEnabled: true, createdAt: new Date(), updatedAt: new Date() }
    }
  }

  // Update system settings (admin only)
  updateSystemSettings(updates: Partial<SystemSettings>): boolean {
    if (!this.isClient() || !this.isCurrentUserAdmin()) return false

    const current = this.getSystemSettings()
    const updated: SystemSettings = {
      ...current,
      ...updates,
      updatedAt: new Date()
    }

    localStorage.setItem(this.KEYS.SYSTEM_SETTINGS, JSON.stringify({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    }))
    
    return true
  }

  // Check if current user is admin
  isCurrentUserAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'admin'
  }

  // Register new user
  async register(username: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!this.isClient()) {
      return { success: false, error: 'Registration only available on client' }
    }

    // Check if registration is enabled (unless this is the first user)
    if (this.hasUsers() && !this.isRegistrationEnabled()) {
      return { success: false, error: 'Registrierung ist derzeit deaktiviert' }
    }

    // Validation
    if (!username || username.length < 3) {
      return { success: false, error: 'Benutzername muss mindestens 3 Zeichen lang sein' }
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Gültige E-Mail-Adresse erforderlich' }
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Passwort muss mindestens 6 Zeichen lang sein' }
    }

    const users = this.getUsers()

    // Check for existing username or email
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Benutzername bereits vergeben' }
    }

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'E-Mail-Adresse bereits registriert' }
    }

    try {
      // Generate salt and hash password
      const salt = this.generateRandomBytes(32)
      const passwordHash = await this.hashPassword(password, salt)

      // Create new user - first user becomes admin
      const isFirstUser = users.length === 0
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        passwordHash,
        salt: this.bytesToHex(salt),
        role: isFirstUser ? 'admin' : 'user',
        createdAt: new Date()
      }

      // If this is the first user, set up default system settings
      if (isFirstUser) {
        const defaultSettings: SystemSettings = {
          registrationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        localStorage.setItem(this.KEYS.SYSTEM_SETTINGS, JSON.stringify({
          ...defaultSettings,
          createdAt: defaultSettings.createdAt.toISOString(),
          updatedAt: defaultSettings.updatedAt.toISOString()
        }))
      }

      // Save user
      users.push(newUser)
      this.saveUsers(users)

      return { success: true, user: newUser }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Fehler bei der Registrierung' }
    }
  }

  // Login user
  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!this.isClient()) {
      return { success: false, error: 'Login only available on client' }
    }

    const users = this.getUsers()
    const user = users.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    )

    if (!user) {
      return { success: false, error: 'Benutzer nicht gefunden' }
    }

    try {
      const isValidPassword = await this.verifyPassword(password, user.passwordHash, user.salt)
      
      if (!isValidPassword) {
        return { success: false, error: 'Falsches Passwort' }
      }

      // Update last login
      user.lastLogin = new Date()
      this.saveUsers(users)

      // Create session
      const session: AuthSession = {
        userId: user.id,
        token: this.generateSessionToken(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      // Save session
      localStorage.setItem(this.KEYS.CURRENT_SESSION, JSON.stringify({
        ...session,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString()
      }))

      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify({
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString()
      }))

      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Fehler beim Anmelden' }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!this.isClient()) return false

    const sessionData = localStorage.getItem(this.KEYS.CURRENT_SESSION)
    const userData = localStorage.getItem(this.KEYS.CURRENT_USER)

    if (!sessionData || !userData) return false

    try {
      const session = JSON.parse(sessionData)
      const expiresAt = new Date(session.expiresAt)
      
      if (expiresAt < new Date()) {
        // Session expired
        this.logout()
        return false
      }

      return true
    } catch (error) {
      console.error('Auth check error:', error)
      this.logout()
      return false
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (!this.isClient() || !this.isAuthenticated()) return null

    try {
      const userData = localStorage.getItem(this.KEYS.CURRENT_USER)
      if (!userData) return null

      const user = JSON.parse(userData)
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Logout user
  logout(): void {
    if (!this.isClient()) return

    localStorage.removeItem(this.KEYS.CURRENT_SESSION)
    localStorage.removeItem(this.KEYS.CURRENT_USER)
  }

  // Clear all auth data (for testing)
  clearAllAuthData(): void {
    if (!this.isClient()) return

    localStorage.removeItem(this.KEYS.USERS)
    localStorage.removeItem(this.KEYS.CURRENT_SESSION)
    localStorage.removeItem(this.KEYS.CURRENT_USER)
  }

  // Temporary function to make first user admin (for migration purposes)
  makeFirstUserAdmin(): { success: boolean; message: string } {
    if (!this.isClient()) {
      return { success: false, message: 'Not available on server' }
    }

    const users = this.getUsers()
    if (users.length === 0) {
      return { success: false, message: 'No users found' }
    }

    // Find the first created user (oldest createdAt)
    const firstUser = users.reduce((oldest, current) => 
      new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
    )

    if (firstUser.role === 'admin') {
      return { success: false, message: `User ${firstUser.username} is already admin` }
    }

    // Make first user admin
    firstUser.role = 'admin'
    this.saveUsers(users)

    // Update current user in localStorage if it's the same user
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === firstUser.id) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(firstUser))
    }

    return { success: true, message: `User ${firstUser.username} was successfully made admin` }
  }

  // Alternative: Make specific user admin by username
  makeUserAdmin(username: string): { success: boolean; message: string } {
    if (!this.isClient()) {
      return { success: false, message: 'Not available on server' }
    }

    const users = this.getUsers()
    const user = users.find(u => u.username === username)

    if (!user) {
      return { success: false, message: `User ${username} not found` }
    }

    if (user.role === 'admin') {
      return { success: false, message: `User ${username} is already admin` }
    }

    user.role = 'admin'
    this.saveUsers(users)

    // Update current user in localStorage if it's the same user
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user))
    }

    return { success: true, message: `User ${username} was successfully made admin` }
  }
}

// Export singleton instance
export const authManager = new AuthManager() 