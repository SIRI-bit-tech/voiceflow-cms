"use client"

import type React from "react"
import { createContext, useContext, useEffect, useReducer, useRef } from "react"
import { VoiceRecognitionEngine } from "@/lib/voice-recognition"
import { SpatialAudioEngine } from "@/lib/spatial-audio"
import { apiClient } from "@/lib/api"
import type { VoiceCommand, VoiceUser, SpatialPosition, VoiceProcessingResponse } from "@/types/voice"

interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  currentCommand: VoiceCommand | null
  lastTranscript: string
  user: VoiceUser | null
  currentPosition: SpatialPosition
  audioFeedbackEnabled: boolean
  voiceCalibrated: boolean
  spatialAudioEnabled: boolean
  error: string | null
}

type VoiceAction =
  | { type: "START_LISTENING" }
  | { type: "STOP_LISTENING" }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_COMMAND"; payload: VoiceCommand }
  | { type: "SET_TRANSCRIPT"; payload: string }
  | { type: "SET_USER"; payload: VoiceUser }
  | { type: "SET_POSITION"; payload: SpatialPosition }
  | { type: "TOGGLE_AUDIO_FEEDBACK" }
  | { type: "SET_VOICE_CALIBRATED"; payload: boolean }
  | { type: "TOGGLE_SPATIAL_AUDIO" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }

const initialState: VoiceState = {
  isListening: false,
  isProcessing: false,
  currentCommand: null,
  lastTranscript: "",
  user: null,
  currentPosition: { x: 0, y: 0, z: 0, room: "lobby" },
  audioFeedbackEnabled: true,
  voiceCalibrated: false,
  spatialAudioEnabled: true,
  error: null,
}

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case "START_LISTENING":
      return { ...state, isListening: true, error: null }
    case "STOP_LISTENING":
      return { ...state, isListening: false }
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload }
    case "SET_COMMAND":
      return { ...state, currentCommand: action.payload }
    case "SET_TRANSCRIPT":
      return { ...state, lastTranscript: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_POSITION":
      return { ...state, currentPosition: action.payload }
    case "TOGGLE_AUDIO_FEEDBACK":
      return { ...state, audioFeedbackEnabled: !state.audioFeedbackEnabled }
    case "SET_VOICE_CALIBRATED":
      return { ...state, voiceCalibrated: action.payload }
    case "TOGGLE_SPATIAL_AUDIO":
      return { ...state, spatialAudioEnabled: !state.spatialAudioEnabled }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

interface VoiceContextType {
  state: VoiceState
  startListening: () => void
  stopListening: () => void
  processVoiceCommand: (command: string) => Promise<void>
  speakFeedback: (message: string, position?: SpatialPosition) => void
  navigateToRoom: (room: string) => void
  calibrateVoice: () => Promise<boolean>
  toggleAudioFeedback: () => void
  toggleSpatialAudio: () => void
}

const VoiceContext = createContext<VoiceContextType | null>(null)

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(voiceReducer, initialState)
  const voiceEngineRef = useRef<VoiceRecognitionEngine | null>(null)
  const spatialEngineRef = useRef<SpatialAudioEngine | null>(null)

  useEffect(() => {
    // Initialize voice recognition engine
    voiceEngineRef.current = new VoiceRecognitionEngine()
    spatialEngineRef.current = new SpatialAudioEngine()

    // Initialize spatial audio
    if (state.spatialAudioEnabled) {
      spatialEngineRef.current.initialize().catch((error) => {
        console.error("Failed to initialize spatial audio:", error)
        dispatch({ type: "SET_ERROR", payload: "Spatial audio initialization failed" })
      })
    }

    // Register voice commands
    const engine = voiceEngineRef.current
    if (engine) {
      // Navigation commands
      engine.registerCommand("navigate", (params: { target?: string }) => {
        navigateToRoom(params.target as string)
      })

      // Content commands
      engine.registerCommand("create-content", (params: { type: string }) => {
        handleContentCreation(params.type)
      })

      // System commands
      engine.registerCommand("help", () => {
        speakFeedback(
          "Available commands: Navigate to dashboard, create new blog post, show my content, help, settings",
        )
      })

      engine.registerCommand("settings", () => {
        speakFeedback("Opening settings panel")
        // Navigate to settings
      })

      engine.registerCommand("search", (params: { query?: string | undefined }) => {
        handleSearch(params.query || "")
      })
    }

    return () => {
      voiceEngineRef.current?.stopListening()
      spatialEngineRef.current?.cleanup()
    }
  }, [])

  const startListening = () => {
    if (voiceEngineRef.current) {
      dispatch({ type: "START_LISTENING" })
      voiceEngineRef.current.startListening()

      if (state.audioFeedbackEnabled) {
        speakFeedback("Voice commands activated. I'm listening.")
      }
    } else {
      dispatch({ type: "SET_ERROR", payload: "Voice recognition not available" })
    }
  }

  const stopListening = () => {
    if (voiceEngineRef.current) {
      dispatch({ type: "STOP_LISTENING" })
      voiceEngineRef.current.stopListening()

      if (state.audioFeedbackEnabled) {
        speakFeedback("Voice commands deactivated.")
      }
    }
  }

  const processVoiceCommand = async (command: string) => {
    dispatch({ type: "SET_PROCESSING", payload: true })
    dispatch({ type: "SET_TRANSCRIPT", payload: command })

    try {
      const response: VoiceProcessingResponse = await apiClient.processVoiceCommand(command)

      const voiceCommand: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        command: command.toLowerCase(),
        action: response.action,
        parameters: response.parameters,
        confidence: 0.9,
        timestamp: new Date(),
      }

      dispatch({ type: "SET_COMMAND", payload: voiceCommand })

      // Handle the response action
      if (response.action === "create_content") {
        speakFeedback("Creating new content as requested")
      } else if (response.action === "navigate") {
        speakFeedback("Navigating as requested")
      } else if (response.message) {
        speakFeedback(response.message)
      }
    } catch (error: any) {
      console.error("Error processing voice command:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to process voice command" })
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false })
    }
  }

  const speakFeedback = (message: string, position?: SpatialPosition) => {
    if (!state.audioFeedbackEnabled) return

    if (position && spatialEngineRef.current && state.spatialAudioEnabled) {
      // Use spatial audio for positioned feedback
      spatialEngineRef.current.playAudioCue(message, position)
    } else {
      // Use regular speech synthesis
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const navigateToRoom = (room: string) => {
    const roomPositions: Record<string, SpatialPosition> = {
      lobby: { x: 0, y: 0, z: 0, room: "lobby" },
      "blog-room": { x: -10, y: 0, z: -5, room: "blog-room" },
      "pages-wing": { x: 10, y: 0, z: -5, room: "pages-wing" },
      "draft-corner": { x: 5, y: 0, z: 10, room: "draft-corner" },
      "archive-basement": { x: 0, y: -5, z: 0, room: "archive-basement" },
    }

    const targetPosition = roomPositions[room]
    if (targetPosition) {
      dispatch({ type: "SET_POSITION", payload: targetPosition })

      if (spatialEngineRef.current) {
        spatialEngineRef.current.updateListenerPosition(targetPosition.x, targetPosition.y, targetPosition.z)
      }

      const roomNames: Record<string, string> = {
        lobby: "main lobby",
        "blog-room": "blog room",
        "pages-wing": "pages wing",
        "draft-corner": "draft corner",
        "archive-basement": "archive basement",
      }

      speakFeedback(`Navigating to ${roomNames[room]}`, targetPosition)
    } else {
      speakFeedback(`Unknown location: ${room}`)
    }
  }

  const handleContentCreation = (type: string) => {
    speakFeedback(`Creating new ${type}. Please provide a title.`)
    // This would trigger content creation flow
  }

  const handleSearch = (query: string) => {
    speakFeedback(`Searching for: ${query}`)
    // This would trigger search functionality
  }

  const calibrateVoice = async (): Promise<boolean> => {
    try {
      dispatch({ type: "SET_PROCESSING", payload: true })
      speakFeedback("Starting voice calibration. Please speak clearly.")

      // Simulate voice calibration process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      dispatch({ type: "SET_VOICE_CALIBRATED", payload: true })
      speakFeedback("Voice calibration complete.")
      return true
    } catch (error: any) {
      console.error("Voice calibration failed:", error)
      dispatch({ type: "SET_ERROR", payload: "Voice calibration failed" })
      return false
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false })
    }
  }

  const toggleAudioFeedback = () => {
    dispatch({ type: "TOGGLE_AUDIO_FEEDBACK" })
    const newState = !state.audioFeedbackEnabled
    speakFeedback(newState ? "Audio feedback enabled" : "Audio feedback disabled")
  }

  const toggleSpatialAudio = () => {
    dispatch({ type: "TOGGLE_SPATIAL_AUDIO" })
    const newState = !state.spatialAudioEnabled
    speakFeedback(newState ? "Spatial audio enabled" : "Spatial audio disabled")
  }

  const contextValue: VoiceContextType = {
    state,
    startListening,
    stopListening,
    processVoiceCommand,
    speakFeedback,
    navigateToRoom,
    calibrateVoice,
    toggleAudioFeedback,
    toggleSpatialAudio,
  }

  return <VoiceContext.Provider value={contextValue}>{children}</VoiceContext.Provider>
}

export function useVoice() {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider")
  }
  return context
}
