export interface AdminUser {
    id: string
    name: string
    email: string
    role: "admin" | "editor" | "user"
    status: "active" | "inactive" | "suspended"
    lastLogin: string
    createdAt: string
    voiceProfile?: {
      isSetup: boolean
      lastVoiceLogin: string
      voiceCommandsUsed: number
    }
    spatialNavigation?: {
      roomsVisited: string[]
      totalNavigationTime: number
      preferredRoom: string
    }
  }
  
  export interface ContentAnalytics {
    totalContent: number
    publishedContent: number
    draftContent: number
    contentByType: Record<string, number>
    contentByAuthor: Record<string, number>
    recentActivity: ContentActivity[]
    popularContent: ContentPerformance[]
  }
  
  export interface ContentActivity {
    id: string
    type: "created" | "updated" | "published" | "deleted"
    contentTitle: string
    authorName: string
    timestamp: string
    room: string
  }
  
  export interface ContentPerformance {
    id: string
    title: string
    type: string
    views: number
    voiceInteractions: number
    spatialVisits: number
    lastAccessed: string
  }
  
  export interface VoiceAnalytics {
    totalVoiceCommands: number
    uniqueVoiceUsers: number
    averageSessionDuration: number
    commandsByType: Record<string, number>
    voiceErrorRate: number
    biometricSuccessRate: number
    popularCommands: VoiceCommand[]
  }
  
  export interface VoiceCommand {
    command: string
    usage: number
    successRate: number
    averageProcessingTime: number
  }
  
  export interface SpatialAnalytics {
    totalRooms: number
    activeRooms: number
    roomVisits: Record<string, number>
    averageNavigationTime: number
    spatialInteractions: number
    popularPaths: NavigationPath[]
  }
  
  export interface NavigationPath {
    from: string
    to: string
    frequency: number
    averageTime: number
  }
  
  export interface SystemHealth {
    status: "healthy" | "warning" | "critical"
    uptime: number
    memoryUsage: number
    cpuUsage: number
    activeUsers: number
    voiceProcessingLoad: number
    spatialAudioLoad: number
    lastHealthCheck: string
  }
  