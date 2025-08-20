"use client"

import { useEffect } from "react"

import { useState } from "react"

import { useAuth } from "@/contexts/auth-context"

export interface WebSocketMessage {
  type:
    | "voice_stream"
    | "spatial_update"
    | "voice_command"
    | "content_collaboration"
    | "user_joined"
    | "user_left"
    | "voice_session_started"
    | "user_joined_voice_session"
    | "voice_session_ended"
    | "user_moved"
    | "voice_command_executed"
    | "content_updated"
  data?: unknown
  user_id?: string
  workspace_id?: string
  timestamp?: string
  position?: { x: number; y: number; z: number }
  command?: string
  content_id?: string
  changes?: unknown
  session_id?: string
  result?: unknown
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map()
  private isConnecting = false

  constructor(
    private userId: string,
    private workspaceId?: string,
    private onConnectionChange?: (connected: boolean) => void,
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
        resolve()
        return
      }

      this.isConnecting = true
      const wsUrl = `ws://localhost:8000/ws/${this.userId}${this.workspaceId ? `?workspace_id=${this.workspaceId}` : ""}`

      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("[v0] WebSocket connected")
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.onConnectionChange?.(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("[v0] Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onclose = () => {
          console.log("[v0] WebSocket disconnected")
          this.isConnecting = false
          this.onConnectionChange?.(false)
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
          this.isConnecting = false
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.onConnectionChange?.(false)
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`[v0] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    }
  }

  onMessage(type: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(type, handler)
  }

  offMessage(type: string) {
    this.messageHandlers.delete(type)
  }

  sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("[v0] WebSocket not connected, message not sent:", message)
    }
  }

  // Voice streaming methods
  sendVoiceStream(voiceData: unknown, spatialPosition?: { x: number; y: number; z: number }) {
    this.sendMessage({
      type: "voice_stream",
      data: {
        voiceData,
        spatial_position: spatialPosition,
      },
    })
  }

  // Spatial navigation methods
  updateSpatialPosition(position: { x: number; y: number; z: number }) {
    this.sendMessage({
      type: "spatial_update",
      position,
    })
  }

  // Voice command methods
  sendVoiceCommand(command: string) {
    this.sendMessage({
      type: "voice_command",
      command,
    })
  }

  // Content collaboration methods
  sendContentUpdate(contentId: string, changes: unknown) {
    this.sendMessage({
      type: "content_collaboration",
      content_id: contentId,
      changes,
    })
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Hook for using WebSocket in React components
export function useWebSocket(workspaceId?: string) {
  const { user } = useAuth()
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (user?.id) {
      const manager = new WebSocketManager(user.id, workspaceId, setIsConnected)

      manager.connect().catch(console.error)
      setWsManager(manager)

      return () => {
        manager.disconnect()
      }
    }
  }, [user?.id, workspaceId])

  return {
    wsManager,
    isConnected,
    sendMessage: (message: WebSocketMessage) => wsManager?.sendMessage(message),
    onMessage: (type: string, handler: (message: WebSocketMessage) => void) => wsManager?.onMessage(type, handler),
    offMessage: (type: string) => wsManager?.offMessage(type),
  }
}
