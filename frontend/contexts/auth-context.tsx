"use client"

import type React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"
import { apiClient } from "@/lib/api"
import type { AuthState, User, LoginCredentials, RegisterData } from "@/types/auth"

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "LOGOUT" }
  | { type: "START_VOICE_AUTH" }
  | { type: "END_VOICE_AUTH" }
  | { type: "INCREMENT_VOICE_ATTEMPTS" }
  | { type: "RESET_VOICE_ATTEMPTS" }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  voiceAuthInProgress: false,
  voiceAuthAttempts: 0,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "SET_TOKEN":
      return { ...state, token: action.payload }
    case "LOGOUT":
      return {
        ...initialState,
        voiceAuthAttempts: state.voiceAuthAttempts,
      }
    case "START_VOICE_AUTH":
      return { ...state, voiceAuthInProgress: true }
    case "END_VOICE_AUTH":
      return { ...state, voiceAuthInProgress: false }
    case "INCREMENT_VOICE_ATTEMPTS":
      return { ...state, voiceAuthAttempts: state.voiceAuthAttempts + 1 }
    case "RESET_VOICE_ATTEMPTS":
      return { ...state, voiceAuthAttempts: 0 }
    default:
      return state
  }
}

interface AuthContextType {
  state: AuthState
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  voiceLogin: (username: string, passphrase: string) => Promise<void>
  setupVoiceBiometrics: (passphrases: string[]) => Promise<void>
  updateVoiceProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      apiClient.setToken(token)
      dispatch({ type: "SET_TOKEN", payload: token })
      // Set user as authenticated - in production, validate token with backend
      dispatch({ type: "SET_USER", payload: { id: "user", email: "user@example.com", full_name: "User" } })
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      const response = await apiClient.login(credentials.email, credentials.password)

      apiClient.setToken(response.access_token)
      dispatch({ type: "SET_TOKEN", payload: response.access_token })
      dispatch({ type: "SET_USER", payload: response.user })
      dispatch({ type: "RESET_VOICE_ATTEMPTS" })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Login failed" })
    }
  }

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      const response = await apiClient.register(data.email, data.password, data.full_name)

      apiClient.setToken(response.access_token)
      dispatch({ type: "SET_TOKEN", payload: response.access_token })
      dispatch({ type: "SET_USER", payload: response.user })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Registration failed" })
    }
  }

  const voiceLogin = async (username: string, passphrase: string) => {
    try {
      dispatch({ type: "START_VOICE_AUTH" })
      dispatch({ type: "SET_ERROR", payload: null })

      const response = await apiClient.voiceLogin({ username, passphrase })

      apiClient.setToken(response.access_token)
      dispatch({ type: "SET_TOKEN", payload: response.access_token })
      dispatch({ type: "SET_USER", payload: response.user })
      dispatch({ type: "RESET_VOICE_ATTEMPTS" })
    } catch (error) {
      dispatch({ type: "INCREMENT_VOICE_ATTEMPTS" })
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Voice login failed" })
    } finally {
      dispatch({ type: "END_VOICE_AUTH" })
    }
  }

  const setupVoiceBiometrics = async (passphrases: string[]) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      await apiClient.setupVoiceBiometric("voice_data_placeholder", passphrases[0])

      // Update user data to reflect voice profile setup
      if (state.user) {
        const updatedUser = { ...state.user, voice_profile: { passphrase: passphrases[0] } }
        dispatch({ type: "SET_USER", payload: updatedUser })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Voice setup failed" })
    }
  }

  const updateVoiceProfile = async () => {
    // Implementation for updating voice profile
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      // Voice profile update logic
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Profile update failed" })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Password reset failed")
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Password reset failed" })
    }
  }

  const logout = () => {
    apiClient.clearToken()
    dispatch({ type: "LOGOUT" })
  }

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    voiceLogin,
    setupVoiceBiometrics,
    updateVoiceProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
