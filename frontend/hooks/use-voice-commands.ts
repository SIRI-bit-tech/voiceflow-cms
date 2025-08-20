"use client"

import { useEffect, useCallback } from "react"
import { useVoice } from "@/contexts/voice-context"

interface VoiceCommandHook {
  registerCommand: (pattern: string, callback: () => void) => void
  unregisterCommand: (pattern: string) => void
  executeCommand: (command: string) => void
}

export function useVoiceCommands(): VoiceCommandHook {
  const { processVoiceCommand, speakFeedback } = useVoice()
  const commandCallbacks = new Map<string, () => void>()

  const registerCommand = useCallback((pattern: string, callback: () => void) => {
    commandCallbacks.set(pattern.toLowerCase(), callback)
  }, [])

  const unregisterCommand = useCallback((pattern: string) => {
    commandCallbacks.delete(pattern.toLowerCase())
  }, [])

  const executeCommand = useCallback(
    (command: string) => {
      const normalizedCommand = command.toLowerCase()

      // Find matching command pattern
      for (const [pattern, callback] of commandCallbacks.entries()) {
        if (normalizedCommand.includes(pattern)) {
          callback()
          return
        }
      }

      // If no command found, process through main voice system
      processVoiceCommand(command)
    },
    [processVoiceCommand],
  )

  return {
    registerCommand,
    unregisterCommand,
    executeCommand,
  }
}

// Hook for voice-controlled navigation
export function useVoiceNavigation() {
  const { navigateToRoom, speakFeedback, state } = useVoice()
  const { registerCommand } = useVoiceCommands()

  useEffect(() => {
    // Register navigation commands
    registerCommand("go to dashboard", () => navigateToRoom("lobby"))
    registerCommand("navigate to dashboard", () => navigateToRoom("lobby"))
    registerCommand("go to blog", () => navigateToRoom("blog-room"))
    registerCommand("navigate to blog", () => navigateToRoom("blog-room"))
    registerCommand("go to pages", () => navigateToRoom("pages-wing"))
    registerCommand("navigate to pages", () => navigateToRoom("pages-wing"))
    registerCommand("go to drafts", () => navigateToRoom("draft-corner"))
    registerCommand("navigate to drafts", () => navigateToRoom("draft-corner"))
    registerCommand("go to archive", () => navigateToRoom("archive-basement"))
    registerCommand("navigate to archive", () => navigateToRoom("archive-basement"))

    // Location awareness commands
    registerCommand("where am i", () => {
      const roomNames: Record<string, string> = {
        lobby: "main lobby",
        "blog-room": "blog room with your published articles",
        "pages-wing": "pages wing with your static content",
        "draft-corner": "draft corner with work in progress",
        "archive-basement": "archive basement with old content",
      }
      const currentRoom = roomNames[state.currentPosition.room] || "unknown location"
      speakFeedback(`You are currently in the ${currentRoom}`)
    })

    registerCommand("what's around me", () => {
      speakFeedback("Scanning your surroundings for content...")
      // This would trigger spatial content detection
    })
  }, [registerCommand, navigateToRoom, speakFeedback, state.currentPosition.room])

  return {
    currentRoom: state.currentPosition.room,
    navigateToRoom,
  }
}

// Hook for voice-controlled content management
export function useVoiceContent() {
  const { speakFeedback } = useVoice()
  const { registerCommand } = useVoiceCommands()

  useEffect(() => {
    // Content creation commands
    registerCommand("create new blog post", () => {
      speakFeedback("Creating new blog post. What would you like the title to be?")
      // Trigger blog post creation flow
    })

    registerCommand("create new page", () => {
      speakFeedback("Creating new page. Please provide a title.")
      // Trigger page creation flow
    })

    registerCommand("show my content", () => {
      speakFeedback("Displaying your content library")
      // Trigger content display
    })

    registerCommand("publish content", () => {
      speakFeedback("Publishing current content")
      // Trigger publish flow
    })

    registerCommand("save as draft", () => {
      speakFeedback("Saving as draft")
      // Trigger draft save
    })

    registerCommand("delete content", () => {
      speakFeedback("Are you sure you want to delete this content? Say 'confirm delete' to proceed.")
      // Trigger delete confirmation
    })
  }, [registerCommand, speakFeedback])

  return {
    // Content management functions would go here
  }
}
