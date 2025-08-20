const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
       (headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.detail || error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    })
  }

  async login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async setupVoiceBiometric(voiceData: string, passphrase: string) {
    return this.request("/api/auth/voice-biometric", {
      method: "POST",
      body: JSON.stringify({ voice_data: voiceData, passphrase }),
    })
  }

  async voiceLogin(voiceData: unknown) {
    return this.request("/api/auth/voice-login", {
      method: "POST",
      body: JSON.stringify(voiceData),
    })
  }

  // Content endpoints
  async createContent(
    title: string,
    content: string,
    contentType: string,
    spatialPosition?: unknown,
    workspaceId?: string,
  ) {
    return this.request("/api/content", {
      method: "POST",
      body: JSON.stringify({
        title,
        content,
        content_type: contentType,
        spatial_position: spatialPosition,
        workspace_id: workspaceId,
      }),
    })
  }

  async getContent(workspaceId?: string) {
    const params = workspaceId ? `?workspace_id=${workspaceId}` : ""
    return this.request(`/api/content${params}`)
  }

  async getContentById(contentId: string) {
    return this.request(`/api/content/${contentId}`)
  }

  async updateContent(contentId: string, title: string, content: string, contentType: string, spatialPosition?: unknown) {
    return this.request(`/api/content/${contentId}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        content,
        content_type: contentType,
        spatial_position: spatialPosition,
      }),
    })
  }

  async deleteContent(contentId: string) {
    return this.request(`/api/content/${contentId}`, {
      method: "DELETE",
    })
  }

  // Workspace endpoints
  async createWorkspace(name: string, description: string, spatialConfig: unknown) {
    return this.request("/api/workspaces", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        spatial_config: spatialConfig,
      }),
    })
  }

  async getWorkspaces() {
    return this.request("/api/workspaces")
  }

  // Voice processing endpoints
  async processVoiceCommand(command: string) {
    return this.request("/api/voice/process-command", {
      method: "POST",
      body: JSON.stringify({ command }),
    })
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request("/api/analytics/dashboard")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
