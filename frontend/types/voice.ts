// Voice processing and spatial audio types
export interface VoiceCommand {
    id: string
    command: string
    action: string
    parameters?: Record<string, unknown>
    confidence: number
    timestamp: Date
  }
  
  export interface SpatialPosition {
    x: number
    y: number
    z: number
    room: string
  }
  
  export interface VoiceUser {
    id: string
    username: string
    email: string
    voicePrint: string
    spatialSettings: SpatialAudioSettings
    workspaces: string[]
    role: "creator" | "editor" | "admin"
  }
  
  export interface SpatialAudioSettings {
    headphoneCalibrated: boolean
    preferredVolume: number
    spatialSensitivity: number
    roomAcoustics: "small" | "medium" | "large"
  }
  
  export interface ContentItem {
    id: string
    title: string
    content: string
    type: "blog" | "page" | "draft"
    position: SpatialPosition
    audioDescription?: string
    createdAt: Date
    updatedAt: Date
    authorId: string
  }
  
  export interface VoiceWorkspace {
    id: string
    name: string
    description: string
    spatialLayout: SpatialLayout
    members: string[]
    content: ContentItem[]
    audioEnvironment: AudioEnvironment
  }
  
  export interface SpatialLayout {
    lobby: SpatialPosition
    blogRoom: SpatialPosition
    pagesWing: SpatialPosition
    draftCorner: SpatialPosition
    archiveBasement: SpatialPosition
  }
  
  export interface AudioEnvironment {
    ambientSound: string
    reverbLevel: number
    spatialAccuracy: "low" | "medium" | "high"
  }
  
  export interface VoiceProcessingResponse {
    action: string
    parameters?: Record<string, unknown>
    message?: string
  }
  