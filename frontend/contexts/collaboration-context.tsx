"use client"

import { useState } from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useVoice } from "@/contexts/voice-context"
import { WebSocketManager } from "@/lib/websocket"
import type {
  Workspace,
  WorkspaceMember,
  CollaborationSession,
  WorkspaceInvitation,
  SessionParticipant,
} from "@/types/collaboration"

// WebSocket message type definitions
interface WebSocketMessage {
  user_id?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  command?: string;
  message?: string;
  room?: string;
}

interface CollaborationState {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  activeSession: CollaborationSession | null
  participants: SessionParticipant[]
  invitations: WorkspaceInvitation[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

type CollaborationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_CURRENT_WORKSPACE"; payload: Workspace | null }
  | { type: "SET_WORKSPACES"; payload: Workspace[] }
  | { type: "ADD_WORKSPACE"; payload: Workspace }
  | { type: "UPDATE_WORKSPACE"; payload: Workspace }
  | { type: "REMOVE_WORKSPACE"; payload: string }
  | { type: "SET_ACTIVE_SESSION"; payload: CollaborationSession | null }
  | { type: "SET_PARTICIPANTS"; payload: SessionParticipant[] }
  | { type: "ADD_PARTICIPANT"; payload: SessionParticipant }
  | { type: "UPDATE_PARTICIPANT"; payload: SessionParticipant }
  | { type: "REMOVE_PARTICIPANT"; payload: string }
  | { type: "SET_INVITATIONS"; payload: WorkspaceInvitation[] }
  | { type: "ADD_INVITATION"; payload: WorkspaceInvitation }
  | { type: "UPDATE_INVITATION"; payload: WorkspaceInvitation }

const initialState: CollaborationState = {
  currentWorkspace: null,
  workspaces: [],
  activeSession: null,
  participants: [],
  invitations: [],
  isConnected: false,
  isLoading: false,
  error: null,
}

function collaborationReducer(state: CollaborationState, action: CollaborationAction): CollaborationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload }
    case "SET_CURRENT_WORKSPACE":
      return { ...state, currentWorkspace: action.payload }
    case "SET_WORKSPACES":
      return { ...state, workspaces: action.payload, isLoading: false }
    case "ADD_WORKSPACE":
      return { ...state, workspaces: [...state.workspaces, action.payload] }
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => (ws.id === action.payload.id ? action.payload : ws)),
        currentWorkspace: state.currentWorkspace?.id === action.payload.id ? action.payload : state.currentWorkspace,
      }
    case "REMOVE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter((ws) => ws.id !== action.payload),
        currentWorkspace: state.currentWorkspace?.id === action.payload ? null : state.currentWorkspace,
      }
    case "SET_ACTIVE_SESSION":
      return { ...state, activeSession: action.payload }
    case "SET_PARTICIPANTS":
      return { ...state, participants: action.payload }
    case "ADD_PARTICIPANT":
      return { ...state, participants: [...state.participants, action.payload] }
    case "UPDATE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.map((p) => (p.userId === action.payload.userId ? action.payload : p)),
      }
    case "REMOVE_PARTICIPANT":
      return { ...state, participants: state.participants.filter((p) => p.userId !== action.payload) }
    case "SET_INVITATIONS":
      return { ...state, invitations: action.payload }
    case "ADD_INVITATION":
      return { ...state, invitations: [...state.invitations, action.payload] }
    case "UPDATE_INVITATION":
      return {
        ...state,
        invitations: state.invitations.map((inv) => (inv.id === action.payload.id ? action.payload : inv)),
      }
    default:
      return state
  }
}

interface CollaborationContextType {
  state: CollaborationState
  wsManager: WebSocketManager | null
  loadWorkspaces: () => Promise<void>
  createWorkspace: (workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">) => Promise<void>
  switchWorkspace: (workspaceId: string) => Promise<void>
  inviteMember: (workspaceId: string, email: string, role: WorkspaceMember["role"]) => Promise<void>
  acceptInvitation: (invitationId: string) => Promise<void>
  startCollaboration: (workspaceId: string, type: CollaborationSession["type"]) => Promise<void>
  joinCollaboration: (sessionId: string) => Promise<void>
  leaveCollaboration: () => Promise<void>
  updateLocation: (room: string, x: number, y: number, z: number) => Promise<void>
  sendVoiceMessage: (message: string, room: string) => Promise<void>
  connectToWorkspace: (workspaceId: string) => Promise<void>
  disconnectFromWorkspace: () => Promise<void>
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collaborationReducer, initialState)
  const { state: { user } } = useAuth()
  const { speakFeedback } = useVoice()
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null)

  useEffect(() => {
    if (user?.id && state.currentWorkspace?.id) {
      const manager = new WebSocketManager(
        user.id, 
        state.currentWorkspace.id, 
        (connected: boolean) => dispatch({ type: "SET_CONNECTED", payload: connected })
      )

      // Set up message handlers with proper typing
      manager.onMessage("user_joined", (message: WebSocketMessage) => {
        if (message.user_id !== user.id) {
          speakFeedback(`User joined the workspace`)
        }
      })

      manager.onMessage("user_left", (message: WebSocketMessage) => {
        dispatch({ type: "REMOVE_PARTICIPANT", payload: message.user_id || "" })
        speakFeedback(`User left the workspace`)
      })

      manager.onMessage("voice_stream", (message: WebSocketMessage) => {
        // Handle incoming voice streams from other users
        console.log("[v0] Received voice stream from:", message.user_id)
      })

      manager.onMessage("user_moved", (message: WebSocketMessage) => {
        if (message.user_id && message.position) {
          const participant = state.participants.find((p) => p.userId === message.user_id)
          if (participant) {
            const updatedParticipant: SessionParticipant = {
              ...participant,
              currentLocation: {
                room: participant.currentLocation.room,
                ...message.position,
              },
            }
            dispatch({ type: "UPDATE_PARTICIPANT", payload: updatedParticipant })
          }
        }
      })

      manager.onMessage("voice_command_executed", (message: WebSocketMessage) => {
        speakFeedback(`Voice command executed: ${message.command}`)
      })

      manager.onMessage("content_updated", (message: WebSocketMessage) => {
        speakFeedback(`Content updated by another user`)
      })

      manager.connect().catch(console.error)
      setWsManager(manager)

      return () => {
        manager.disconnect()
        setWsManager(null)
      }
    }
  }, [user?.id, state.currentWorkspace?.id])

  const loadWorkspaces = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock data - replace with actual API calls
      const mockWorkspaces: Workspace[] = [
        {
          id: "ws-1",
          name: "Marketing Team",
          description: "Collaborative space for marketing content and campaigns",
          ownerId: user?.id || "user-1",
          ownerName: user?.name || "John Doe",
          members: [
            {
              userId: user?.id || "user-1",
              name: user?.name || "John Doe",
              email: user?.email || "john@example.com",
              role: "owner",
              joinedAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              permissions: {
                canCreateContent: true,
                canEditContent: true,
                canDeleteContent: true,
                canPublishContent: true,
                canManageMembers: true,
                canManageSettings: true,
                canAccessAnalytics: true,
              },
              voiceSettings: {
                canUseVoice: true,
                canHearOthers: true,
                spatialAudioEnabled: true,
              },
            },
          ],
          settings: {
            isPublic: false,
            allowVoiceCollaboration: true,
            enableSpatialAudio: true,
            maxMembers: 50,
            contentApprovalRequired: false,
            voiceCommandsEnabled: true,
            spatialNavigationEnabled: true,
          },
          spatialLayout: {
            rooms: [
              {
                id: "room-1",
                name: "Content Hub",
                type: "content",
                position: { x: 0, y: 0, z: 0 },
                capacity: 10,
                currentOccupants: [],
                permissions: {
                  whoCanEnter: "members",
                  whoCanSpeak: "members",
                  whoCanEdit: "members",
                },
                voiceSettings: {
                  spatialAudioEnabled: true,
                  voiceActivation: true,
                  backgroundNoise: false,
                },
              },
            ],
            connections: [],
            sharedSpaces: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        },
      ]
      dispatch({ type: "SET_WORKSPACES", payload: mockWorkspaces })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load workspaces" })
    }
  }

  const createWorkspace = async (workspaceData: Omit<Workspace, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newWorkspace: Workspace = {
        ...workspaceData,
        id: `ws-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      dispatch({ type: "ADD_WORKSPACE", payload: newWorkspace })
      speakFeedback(`Created workspace: ${newWorkspace.name}`)
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create workspace" })
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    try {
      const workspace = state.workspaces.find((ws) => ws.id === workspaceId)
      if (workspace) {
        dispatch({ type: "SET_CURRENT_WORKSPACE", payload: workspace })
        await connectToWorkspace(workspaceId)
        speakFeedback(`Switched to workspace: ${workspace.name}`)
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to switch workspace" })
    }
  }

  const inviteMember = async (workspaceId: string, email: string, role: WorkspaceMember["role"]) => {
    try {
      const invitation: WorkspaceInvitation = {
        id: `inv-${Date.now()}`,
        workspaceId,
        workspaceName: state.workspaces.find((ws) => ws.id === workspaceId)?.name || "Unknown",
        inviterId: user?.id || "unknown",
        inviterName: user?.name || "Unknown",
        inviteeEmail: email,
        role,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
      dispatch({ type: "ADD_INVITATION", payload: invitation })
      speakFeedback(`Invitation sent to ${email}`)
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to send invitation" })
    }
  }

  const acceptInvitation = async (invitationId: string) => {
    try {
      const invitation = state.invitations.find((inv) => inv.id === invitationId)
      if (invitation) {
        dispatch({ type: "UPDATE_INVITATION", payload: { ...invitation, status: "accepted" } })
        speakFeedback(`Joined workspace: ${invitation.workspaceName}`)
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to accept invitation" })
    }
  }

  const startCollaboration = async (workspaceId: string, type: CollaborationSession["type"]) => {
    try {
      const session: CollaborationSession = {
        id: `session-${Date.now()}`,
        workspaceId,
        participants: [],
        startTime: new Date().toISOString(),
        type,
        currentRoom: "content-hub",
        sharedContent: [],
        voiceActivity: [],
      }
      dispatch({ type: "SET_ACTIVE_SESSION", payload: session })
      speakFeedback(`Started ${type} session`)
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to start collaboration" })
    }
  }

  const joinCollaboration = async (sessionId: string) => {
    try {
      if (user) {
        const participant: SessionParticipant = {
          userId: user.id,
          name: user.name,
          joinTime: new Date().toISOString(),
          currentLocation: { room: "content-hub", x: 0, y: 0, z: 0 },
          voiceStatus: "listening",
          isActive: true,
        }
        dispatch({ type: "ADD_PARTICIPANT", payload: participant })
        speakFeedback("Joined collaboration session")
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to join collaboration" })
    }
  }

  const leaveCollaboration = async () => {
    try {
      if (user) {
        dispatch({ type: "REMOVE_PARTICIPANT", payload: user.id })
        dispatch({ type: "SET_ACTIVE_SESSION", payload: null })
        speakFeedback("Left collaboration session")
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to leave collaboration" })
    }
  }

  const updateLocation = async (room: string, x: number, y: number, z: number) => {
    try {
      if (user && state.activeSession) {
        const participant = state.participants.find((p) => p.userId === user.id)
        if (participant) {
          const updatedParticipant: SessionParticipant = {
            ...participant,
            currentLocation: { room, x, y, z },
          }
          dispatch({ type: "UPDATE_PARTICIPANT", payload: updatedParticipant })

          wsManager?.updateSpatialPosition({ x, y, z })
        }
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update location" })
    }
  }

  const sendVoiceMessage = async (message: string, room: string) => {
    try {
      wsManager?.sendVoiceStream({ message, room })
      speakFeedback(`Voice message sent in ${room}: ${message}`)
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to send voice message" })
    }
  }

  const connectToWorkspace = async (workspaceId: string) => {
    try {
      dispatch({ type: "SET_CONNECTED", payload: true })
      // WebSocket connection is handled in useEffect
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to connect to workspace" })
    }
  }

  const disconnectFromWorkspace = async () => {
    try {
      wsManager?.disconnect()
      dispatch({ type: "SET_CONNECTED", payload: false })
      dispatch({ type: "SET_ACTIVE_SESSION", payload: null })
      dispatch({ type: "SET_PARTICIPANTS", payload: [] })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to disconnect from workspace" })
    }
  }

  useEffect(() => {
    if (user) {
      loadWorkspaces()
    }
  }, [user])

  return (
    <CollaborationContext.Provider
      value={{
        state,
        wsManager,
        loadWorkspaces,
        createWorkspace,
        switchWorkspace,
        inviteMember,
        acceptInvitation,
        startCollaboration,
        joinCollaboration,
        leaveCollaboration,
        updateLocation,
        sendVoiceMessage,
        connectToWorkspace,
        disconnectFromWorkspace,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  )
}

export function useCollaboration() {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error("useCollaboration must be used within a CollaborationProvider")
  }
  return context
}