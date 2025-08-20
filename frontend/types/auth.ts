// Authentication and user management types
export interface User {
    id: string
    email: string
    full_name: string
    username?: string
    firstName?: string
    lastName?: string
    role?: "creator" | "editor" | "admin"
    voiceProfile?: VoiceProfile
    workspaces?: string[]
    preferences?: UserPreferences
    createdAt?: Date
    updatedAt?: Date
    lastLogin?: Date
  }
  
  export interface VoiceProfile {
    id: string
    userId: string
    voicePrintHash: string
    voiceSamples: VoiceSample[]
    passphrases: string[]
    calibrationComplete: boolean
    confidenceThreshold: number
    lastCalibration: Date
    biometricEnabled: boolean
  }
  
  export interface VoiceSample {
    id: string
    audioData: string // Base64 encoded audio
    passphrase: string
    duration: number
    quality: number
    recordedAt: Date
  }
  
  export interface UserPreferences {
    spatialAudioEnabled: boolean
    audioFeedbackEnabled: boolean
    voiceCommandSensitivity: number
    preferredVoiceSpeed: number
    roomAcoustics: "small" | "medium" | "large"
    theme: "dark" | "light" | "auto"
  }
  
  export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    token: string | null
    voiceAuthInProgress: boolean
    voiceAuthAttempts: number
  }
  
  export interface LoginCredentials {
    email: string
    password: string
  }
  
  export interface RegisterData {
    email: string
    password: string
    full_name: string
    username?: string
    firstName?: string
    lastName?: string
  }
  
  export interface VoiceAuthData {
    audioData: string
    passphrase: string
    username?: string
  }
  