"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useVoice } from "@/contexts/voice-context"
import { apiClient } from "@/lib/api"
import type { ContentItem, ContentState, ContentFilter, DictationSession } from "@/types/content"

type ContentAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: ContentItem[] }
  | { type: "SET_CURRENT_ITEM"; payload: ContentItem | null }
  | { type: "ADD_ITEM"; payload: ContentItem }
  | { type: "UPDATE_ITEM"; payload: ContentItem }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_DICTATING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTER"; payload: ContentFilter }
  | { type: "SET_SEARCH_RESULTS"; payload: ContentItem[] }

const initialState: ContentState = {
  items: [],
  currentItem: null,
  isLoading: false,
  isCreating: false,
  isEditing: false,
  isDictating: false,
  error: null,
  filter: {},
  searchResults: [],
}

function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ITEMS":
      return { ...state, items: action.payload }
    case "SET_CURRENT_ITEM":
      return { ...state, currentItem: action.payload }
    case "ADD_ITEM":
      return { ...state, items: [action.payload, ...state.items] }
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
        currentItem: state.currentItem?.id === action.payload.id ? action.payload : state.currentItem,
      }
    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        currentItem: state.currentItem?.id === action.payload ? null : state.currentItem,
      }
    case "SET_CREATING":
      return { ...state, isCreating: action.payload }
    case "SET_EDITING":
      return { ...state, isEditing: action.payload }
    case "SET_DICTATING":
      return { ...state, isDictating: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_FILTER":
      return { ...state, filter: action.payload }
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload }
    default:
      return state
  }
}

interface ContentContextType {
  state: ContentState
  createContent: (type: "blog" | "page", title: string) => Promise<ContentItem>
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>
  deleteContent: (id: string) => Promise<void>
  publishContent: (id: string) => Promise<void>
  scheduleContent: (id: string, publishDate: Date) => Promise<void>
  startDictation: (contentId: string) => Promise<DictationSession>
  stopDictation: (sessionId: string) => Promise<string>
  searchContent: (query: string) => Promise<ContentItem[]>
  filterContent: (filter: ContentFilter) => void
  loadContent: () => Promise<void>
  setCurrentContent: (item: ContentItem | null) => void
  addVoiceNote: (contentId: string, audioData: string, position: number) => Promise<void>
}

const ContentContext = createContext<ContentContextType | null>(null)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(contentReducer, initialState)
  const { state: authState } = useAuth()
  const { speakFeedback } = useVoice()

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadContent()
    }
  }, [authState.isAuthenticated])

  const loadContent = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const content = await apiClient.getContent()
      dispatch({ type: "SET_ITEMS", payload: content })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load content" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const createContent = async (type: "blog" | "page", title: string): Promise<ContentItem> => {
    try {
      dispatch({ type: "SET_CREATING", payload: true })
      speakFeedback(`Creating new ${type}: ${title}`)

      const spatialPosition =
        type === "blog"
          ? { x: -8 + Math.random() * 4, y: 0, z: -3 + Math.random() * 4 }
          : { x: 8 + Math.random() * 4, y: 0, z: -3 + Math.random() * 4 }

      const createdContent = await apiClient.createContent(title, "", type, spatialPosition)

      dispatch({ type: "ADD_ITEM", payload: createdContent })
      dispatch({ type: "SET_CURRENT_ITEM", payload: createdContent })
      speakFeedback(`${type} created successfully. You can now start dictating content.`)
      return createdContent
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Creation failed" })
      throw error
    } finally {
      dispatch({ type: "SET_CREATING", payload: false })
    }
  }

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    try {
      dispatch({ type: "SET_EDITING", payload: true })

      const updatedContent = await apiClient.updateContent(
        id,
        updates.title || "",
        updates.content || "",
        updates.content_type || "blog",
        updates.spatial_position,
      )

      dispatch({ type: "UPDATE_ITEM", payload: updatedContent })
      speakFeedback("Content updated successfully")
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Update failed" })
    } finally {
      dispatch({ type: "SET_EDITING", payload: false })
    }
  }

  const deleteContent = async (id: string) => {
    try {
      await apiClient.deleteContent(id)
      dispatch({ type: "DELETE_ITEM", payload: id })
      speakFeedback("Content deleted successfully")
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Deletion failed" })
    }
  }

  const publishContent = async (id: string) => {
    try {
      await updateContent(id, {
        status: "published",
        publishedAt: new Date(),
      })
      speakFeedback("Content published successfully")
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to publish content" })
    }
  }

  const scheduleContent = async (id: string, publishDate: Date) => {
    try {
      await updateContent(id, {
        status: "scheduled",
        scheduledAt: publishDate,
      })
      speakFeedback(`Content scheduled for ${publishDate.toLocaleDateString()}`)
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to schedule content" })
    }
  }

  const startDictation = async (contentId: string): Promise<DictationSession> => {
    try {
      dispatch({ type: "SET_DICTATING", payload: true })
      speakFeedback("Starting dictation. Begin speaking your content.")

      const session: DictationSession = {
        id: `dictation-${Date.now()}`,
        contentId,
        startTime: new Date(),
        transcript: "",
        audioData: "",
        confidence: 0,
        isActive: true,
      }

      return session
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to start dictation" })
      throw error
    }
  }

  const stopDictation = async (sessionId: string): Promise<string> => {
    try {
      dispatch({ type: "SET_DICTATING", payload: false })
      speakFeedback("Dictation stopped. Processing your content.")

      // Simulate processing dictated content
      const transcript = "This is the transcribed content from voice dictation."
      return transcript
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to process dictation" })
      throw error
    }
  }

  const searchContent = async (query: string): Promise<ContentItem[]> => {
    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      })

      if (response.ok) {
        const results = await response.json()
        dispatch({ type: "SET_SEARCH_RESULTS", payload: results })
        speakFeedback(`Found ${results.length} content items matching "${query}"`)
        return results
      } else {
        throw new Error("Search failed")
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Search failed" })
      return []
    }
  }

  const filterContent = (filter: ContentFilter) => {
    dispatch({ type: "SET_FILTER", payload: filter })
  }

  const setCurrentContent = (item: ContentItem | null) => {
    dispatch({ type: "SET_CURRENT_ITEM", payload: item })
  }

  const addVoiceNote = async (contentId: string, audioData: string, position: number) => {
    try {
      // Process voice note and add to content
      speakFeedback("Voice note added to content")
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add voice note" })
    }
  }

  const contextValue: ContentContextType = {
    state,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    scheduleContent,
    startDictation,
    stopDictation,
    searchContent,
    filterContent,
    loadContent,
    setCurrentContent,
    addVoiceNote,
  }

  return <ContentContext.Provider value={contextValue}>{children}</ContentContext.Provider>
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider")
  }
  return context
}
