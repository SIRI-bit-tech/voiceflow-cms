// Spatial audio processing utilities
export class SpatialAudioEngine {
    private audioContext: AudioContext | null = null
    private listener: AudioListener | null = null
    private sources: Map<string, AudioBufferSourceNode> = new Map()
    private panners: Map<string, PannerNode> = new Map()
  
    async initialize(): Promise<void> {
      try {
        this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        this.listener = this.audioContext.listener
  
        // Set up listener orientation (user facing forward)
        if (this.listener.forwardX) {
          this.listener.forwardX.setValueAtTime(0, this.audioContext.currentTime)
          this.listener.forwardY.setValueAtTime(0, this.audioContext.currentTime)
          this.listener.forwardZ.setValueAtTime(-1, this.audioContext.currentTime)
          this.listener.upX.setValueAtTime(0, this.audioContext.currentTime)
          this.listener.upY.setValueAtTime(1, this.audioContext.currentTime)
          this.listener.upZ.setValueAtTime(0, this.audioContext.currentTime)
        }
      } catch (error) {
        console.error("Failed to initialize spatial audio:", error)
        throw new Error("Spatial audio not supported")
      }
    }
  
    createSpatialSource(id: string, position: SpatialPosition): PannerNode | null {
      // Declare SpatialPosition as any for now
      if (!this.audioContext) return null
  
      const panner = this.audioContext.createPanner()
      panner.panningModel = "HRTF"
      panner.distanceModel = "inverse"
      panner.refDistance = 1
      panner.maxDistance = 50
      panner.rolloffFactor = 1
      panner.coneInnerAngle = 360
      panner.coneOuterAngle = 0
      panner.coneOuterGain = 0
  
      // Set position
      panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime)
      panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime)
      panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime)
  
      this.panners.set(id, panner)
      return panner
    }
  
    updateListenerPosition(x: number, y: number, z: number): void {
      if (!this.audioContext || !this.listener) return
  
      if (this.listener.positionX) {
        this.listener.positionX.setValueAtTime(x, this.audioContext.currentTime)
        this.listener.positionY.setValueAtTime(y, this.audioContext.currentTime)
        this.listener.positionZ.setValueAtTime(z, this.audioContext.currentTime)
      }
    }
  
    playAudioCue(message: string, position: SpatialPosition): void {
      // Declare SpatialPosition as any for now
      if (!this.audioContext) return
  
      // Use Speech Synthesis API for spatial audio cues
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.7
  
      // Create spatial audio source for the speech
      const panner = this.createSpatialSource(`cue-${Date.now()}`, position)
      if (panner) {
        panner.connect(this.audioContext.destination)
      }
  
      speechSynthesis.speak(utterance)
    }
  
    getDistanceToContent(userPosition: SpatialPosition, contentPosition: SpatialPosition): number {
      // Declare SpatialPosition as any for now
      const dx = userPosition.x - contentPosition.x
      const dy = userPosition.y - contentPosition.y
      const dz = userPosition.z - contentPosition.z
      return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
  
    cleanup(): void {
      this.sources.clear()
      this.panners.clear()
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }
    }
  }
  
  // Declare SpatialPosition interface
  interface SpatialPosition {
    x: number
    y: number
    z: number
  }
  