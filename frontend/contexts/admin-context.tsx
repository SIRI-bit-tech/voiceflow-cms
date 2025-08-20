"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import type { AdminUser, ContentAnalytics, VoiceAnalytics, SpatialAnalytics, SystemHealth } from "@/types/admin"

interface AdminState {
  users: AdminUser[]
  contentAnalytics: ContentAnalytics | null
  voiceAnalytics: VoiceAnalytics | null
  spatialAnalytics: SpatialAnalytics | null
  systemHealth: SystemHealth | null
  isLoading: boolean
  error: string | null
}

type AdminAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USERS"; payload: AdminUser[] }
  | { type: "SET_CONTENT_ANALYTICS"; payload: ContentAnalytics }
  | { type: "SET_VOICE_ANALYTICS"; payload: VoiceAnalytics }
  | { type: "SET_SPATIAL_ANALYTICS"; payload: SpatialAnalytics }
  | { type: "SET_SYSTEM_HEALTH"; payload: SystemHealth }
  | { type: "UPDATE_USER"; payload: AdminUser }
  | { type: "DELETE_USER"; payload: string }

const initialState: AdminState = {
  users: [],
  contentAnalytics: null,
  voiceAnalytics: null,
  spatialAnalytics: null,
  systemHealth: null,
  isLoading: false,
  error: null,
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "SET_USERS":
      return { ...state, users: action.payload, isLoading: false }
    case "SET_CONTENT_ANALYTICS":
      return { ...state, contentAnalytics: action.payload, isLoading: false }
    case "SET_VOICE_ANALYTICS":
      return { ...state, voiceAnalytics: action.payload, isLoading: false }
    case "SET_SPATIAL_ANALYTICS":
      return { ...state, spatialAnalytics: action.payload, isLoading: false }
    case "SET_SYSTEM_HEALTH":
      return { ...state, systemHealth: action.payload, isLoading: false }
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      }
    default:
      return state
  }
}

interface AdminContextType {
  state: AdminState
  loadUsers: () => Promise<void>
  loadContentAnalytics: () => Promise<void>
  loadVoiceAnalytics: () => Promise<void>
  loadSpatialAnalytics: () => Promise<void>
  loadSystemHealth: () => Promise<void>
  updateUser: (user: AdminUser) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  suspendUser: (userId: string) => Promise<void>
  activateUser: (userId: string) => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState)

  const loadUsers = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // For now, keeping mock data since admin endpoints aren't fully implemented
      const mockUsers: AdminUser[] = [
        {
          id: "1",
          name: "John Admin",
          email: "john@example.com",
          role: "admin",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          voiceProfile: {
            isSetup: true,
            lastVoiceLogin: new Date().toISOString(),
            voiceCommandsUsed: 1250,
          },
          spatialNavigation: {
            roomsVisited: ["content-library", "admin-center", "collaboration-hub"],
            totalNavigationTime: 3600,
            preferredRoom: "content-library",
          },
        },
      ]
      dispatch({ type: "SET_USERS", payload: mockUsers })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load users" })
    }
  }

  const loadContentAnalytics = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const analytics = await apiClient.getAnalytics()

      // Transform backend analytics to match frontend interface
      const contentAnalytics: ContentAnalytics = {
        totalContent: analytics.total_content || 0,
        publishedContent: analytics.total_content || 0,
        draftContent: 0,
        contentByType: { blog: analytics.total_content || 0, page: 0 },
        contentByAuthor: {},
        recentActivity: [],
        popularContent: [],
      }

      dispatch({ type: "SET_CONTENT_ANALYTICS", payload: contentAnalytics })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load content analytics" })
    }
  }

  const loadVoiceAnalytics = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const mockVoiceAnalytics: VoiceAnalytics = {
        totalVoiceCommands: 15420,
        uniqueVoiceUsers: 89,
        averageSessionDuration: 12.5,
        commandsByType: {
          navigation: 5680,
          content: 4230,
          system: 2890,
          search: 2620,
        },
        voiceErrorRate: 0.08,
        biometricSuccessRate: 0.94,
        popularCommands: [
          {
            command: "navigate to content library",
            usage: 1250,
            successRate: 0.96,
            averageProcessingTime: 1.2,
          },
          {
            command: "create new blog post",
            usage: 890,
            successRate: 0.92,
            averageProcessingTime: 1.8,
          },
        ],
      }
      dispatch({ type: "SET_VOICE_ANALYTICS", payload: mockVoiceAnalytics })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load voice analytics" })
    }
  }

  const loadSpatialAnalytics = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const mockSpatialAnalytics: SpatialAnalytics = {
        totalRooms: 8,
        activeRooms: 6,
        roomVisits: {
          "content-library": 2340,
          "editor-workspace": 1890,
          "admin-center": 567,
          "collaboration-hub": 1234,
        },
        averageNavigationTime: 8.5,
        spatialInteractions: 8920,
        popularPaths: [
          {
            from: "content-library",
            to: "editor-workspace",
            frequency: 456,
            averageTime: 3.2,
          },
          {
            from: "editor-workspace",
            to: "content-library",
            frequency: 423,
            averageTime: 2.8,
          },
        ],
      }
      dispatch({ type: "SET_SPATIAL_ANALYTICS", payload: mockSpatialAnalytics })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load spatial analytics" })
    }
  }

  const loadSystemHealth = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const mockSystemHealth: SystemHealth = {
        status: "healthy",
        uptime: 99.8,
        memoryUsage: 68,
        cpuUsage: 45,
        activeUsers: 23,
        voiceProcessingLoad: 32,
        spatialAudioLoad: 28,
        lastHealthCheck: new Date().toISOString(),
      }
      dispatch({ type: "SET_SYSTEM_HEALTH", payload: mockSystemHealth })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load system health" })
    }
  }

  const updateUser = async (user: AdminUser) => {
    try {
      // Mock API call
      dispatch({ type: "UPDATE_USER", payload: user })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update user" })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // Mock API call
      dispatch({ type: "DELETE_USER", payload: userId })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete user" })
    }
  }

  const suspendUser = async (userId: string) => {
    try {
      const user = state.users.find((u) => u.id === userId)
      if (user) {
        await updateUser({ ...user, status: "suspended" })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to suspend user" })
    }
  }

  const activateUser = async (userId: string) => {
    try {
      const user = state.users.find((u) => u.id === userId)
      if (user) {
        await updateUser({ ...user, status: "active" })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to activate user" })
    }
  }

  return (
    <AdminContext.Provider
      value={{
        state,
        loadUsers,
        loadContentAnalytics,
        loadVoiceAnalytics,
        loadSpatialAnalytics,
        loadSystemHealth,
        updateUser,
        deleteUser,
        suspendUser,
        activateUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
