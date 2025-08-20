export interface Workspace {
    id: string
    name: string
    description: string
    ownerId: string
    ownerName: string
    members: WorkspaceMember[]
    settings: WorkspaceSettings
    spatialLayout: SpatialLayout
    createdAt: string
    updatedAt: string
    isActive: boolean
  }
  
  export interface WorkspaceMember {
    userId: string
    name: string
    email: string
    role: "owner" | "admin" | "editor" | "viewer"
    joinedAt: string
    lastActive: string
    permissions: WorkspacePermissions
    voiceSettings: {
      canUseVoice: boolean
      canHearOthers: boolean
      spatialAudioEnabled: boolean
    }
    currentLocation?: {
      room: string
      x: number
      y: number
      z: number
    }
  }
  
  export interface WorkspacePermissions {
    canCreateContent: boolean
    canEditContent: boolean
    canDeleteContent: boolean
    canPublishContent: boolean
    canManageMembers: boolean
    canManageSettings: boolean
    canAccessAnalytics: boolean
  }
  
  export interface WorkspaceSettings {
    isPublic: boolean
    allowVoiceCollaboration: boolean
    enableSpatialAudio: boolean
    maxMembers: number
    contentApprovalRequired: boolean
    voiceCommandsEnabled: boolean
    spatialNavigationEnabled: boolean
  }
  
  export interface SpatialLayout {
    rooms: CollaborationRoom[]
    connections: RoomConnection[]
    sharedSpaces: SharedSpace[]
  }
  
  export interface CollaborationRoom {
    id: string
    name: string
    type: "content" | "meeting" | "private" | "shared"
    position: { x: number; y: number; z: number }
    capacity: number
    currentOccupants: string[]
    permissions: {
      whoCanEnter: "everyone" | "members" | "admins"
      whoCanSpeak: "everyone" | "members" | "admins"
      whoCanEdit: "everyone" | "members" | "admins"
    }
    voiceSettings: {
      spatialAudioEnabled: boolean
      voiceActivation: boolean
      backgroundNoise: boolean
    }
  }
  
  export interface RoomConnection {
    from: string
    to: string
    type: "door" | "portal" | "bridge"
    isLocked: boolean
    requiredRole?: string
  }
  
  export interface SharedSpace {
    id: string
    name: string
    type: "whiteboard" | "document" | "media" | "code"
    position: { x: number; y: number; z: number }
    content: unknown
    collaborators: string[]
    lastModified: string
    permissions: {
      canView: string[]
      canEdit: string[]
      canComment: string[]
    }
  }
  
  export interface CollaborationSession {
    id: string
    workspaceId: string
    participants: SessionParticipant[]
    startTime: string
    endTime?: string
    type: "content-editing" | "meeting" | "brainstorming" | "review"
    currentRoom: string
    sharedContent: string[]
    voiceActivity: VoiceActivity[]
  }
  
  export interface SessionParticipant {
    userId: string
    name: string
    joinTime: string
    leaveTime?: string
    currentLocation: { room: string; x: number; y: number; z: number }
    voiceStatus: "speaking" | "listening" | "muted"
    isActive: boolean
  }
  
  export interface VoiceActivity {
    userId: string
    timestamp: string
    type: "speak" | "command" | "navigation"
    content: string
    room: string
    duration?: number
  }
  
  export interface WorkspaceInvitation {
    id: string
    workspaceId: string
    workspaceName: string
    inviterId: string
    inviterName: string
    inviteeEmail: string
    role: WorkspaceMember["role"]
    status: "pending" | "accepted" | "declined" | "expired"
    createdAt: string
    expiresAt: string
    message?: string
  }
  