// Content management types
export interface ContentItem {
  id: string
  title: string
  content: string
  type: "blog" | "page" | "draft" // Changed from content_type
  position: SpatialPosition // Changed from spatial_position
  workspace_id?: string
  author_id: string
  createdAt: string // Changed from created_at
  updatedAt: string // Changed from updated_at
  status: "draft" | "published" | "archived" | "scheduled"
  excerpt?: string
  slug?: string
  tags?: string[]
  categories?: string[]
  authorName?: string
  audioDescription?: string
  voiceNotes?: VoiceNote[]
  metadata?: ContentMetadata // Keep as optional, handle access with optional chaining
  publishedAt?: Date
  scheduledAt?: Date
}
  export interface SpatialPosition {
    x: number
    y: number
    z: number
    room: string
  }
  
  export interface VoiceNote {
    id: string
    audioData: string
    transcript: string
    timestamp: Date
    position: number // Position in content where note was added
  }
  
  export interface ContentMetadata {
    wordCount: number
    readingTime: number
    seoTitle?: string
    seoDescription?: string
    featuredImage?: string
    lastEditedBy: string
    version: number
    voiceCreated: boolean
    dictationTime: number
  }
  
  export interface ContentFilter {
    type?: "blog" | "page" | "draft"
    status?: "draft" | "published" | "archived" | "scheduled"
    author?: string
    tags?: string[]
    categories?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
    searchQuery?: string
  }
  
  export interface ContentState {
    items: ContentItem[]
    currentItem: ContentItem | null
    isLoading: boolean
    isCreating: boolean
    isEditing: boolean
    isDictating: boolean
    error: string | null
    filter: ContentFilter
    searchResults: ContentItem[]
  }
  
  export interface DictationSession {
    id: string
    contentId: string
    startTime: Date
    endTime?: Date
    transcript: string
    audioData: string
    confidence: number
    isActive: boolean
  }
  