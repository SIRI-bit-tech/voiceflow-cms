// Voice biometric processing and authentication
export class VoiceBiometricEngine {
    private mediaRecorder: MediaRecorder | null = null
    private audioChunks: BlobPart[] = []
    private isRecording = false
  
    async startRecording(): Promise<void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
  
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        })
  
        this.audioChunks = []
        this.isRecording = true
  
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }
  
        this.mediaRecorder.start(100) // Collect data every 100ms
      } catch (error) {
        console.error("Failed to start voice recording:", error)
        throw new Error("Microphone access denied or not available")
      }
    }
  
    async stopRecording(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder || !this.isRecording) {
          reject(new Error("No active recording"))
          return
        }
  
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
          const reader = new FileReader()
  
          reader.onloadend = () => {
            const base64Audio = reader.result as string
            resolve(base64Audio.split(",")[1]) // Remove data URL prefix
          }
  
          reader.onerror = () => reject(new Error("Failed to process audio"))
          reader.readAsDataURL(audioBlob)
        }
  
        this.isRecording = false
        this.mediaRecorder.stop()
  
        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      })
    }
  
    async extractVoiceFeatures(audioData: string): Promise<VoiceFeatures> {
      // Simulate voice feature extraction
      // In a real implementation, this would use ML models for voice analysis
      const features = {
        pitch: Math.random() * 100 + 100, // 100-200 Hz
        formants: [
          Math.random() * 500 + 500, // F1: 500-1000 Hz
          Math.random() * 1000 + 1000, // F2: 1000-2000 Hz
          Math.random() * 1000 + 2000, // F3: 2000-3000 Hz
        ],
        spectralCentroid: Math.random() * 2000 + 1000,
        mfcc: Array.from({ length: 13 }, () => Math.random() * 2 - 1),
        duration: Math.random() * 2 + 2, // 2-4 seconds
        energy: Math.random() * 0.5 + 0.5,
      }
  
      return features
    }
  
    async compareVoiceProfiles(sample1: VoiceFeatures, sample2: VoiceFeatures): Promise<number> {
      // Simulate voice comparison algorithm
      // Returns confidence score between 0 and 1
  
      // Compare pitch
      const pitchDiff = Math.abs(sample1.pitch - sample2.pitch) / 100
      const pitchSimilarity = Math.max(0, 1 - pitchDiff)
  
      // Compare formants
      const formantSimilarity =
        sample1.formants.reduce((acc, f1, i) => {
          const f2 = sample2.formants[i]
          const diff = Math.abs(f1 - f2) / 1000
          return acc + Math.max(0, 1 - diff)
        }, 0) / sample1.formants.length
  
      // Compare MFCC coefficients
      const mfccSimilarity =
        sample1.mfcc.reduce((acc, m1, i) => {
          const m2 = sample2.mfcc[i]
          const diff = Math.abs(m1 - m2) / 2
          return acc + Math.max(0, 1 - diff)
        }, 0) / sample1.mfcc.length
  
      // Weighted average
      const confidence = pitchSimilarity * 0.3 + formantSimilarity * 0.4 + mfccSimilarity * 0.3
  
      return Math.max(0, Math.min(1, confidence))
    }
  
    generateVoicePrintHash(features: VoiceFeatures[]): string {
      // Create a hash from voice features for storage
      const combined = features
        .map((f) => `${f.pitch.toFixed(2)}-${f.formants.join(",")}-${f.spectralCentroid.toFixed(2)}`)
        .join("|")
  
      // Simple hash function (in production, use proper cryptographic hash)
      let hash = 0
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
      }
  
      return Math.abs(hash).toString(16)
    }
  }
  
  interface VoiceFeatures {
    pitch: number
    formants: number[]
    spectralCentroid: number
    mfcc: number[]
    duration: number
    energy: number
  }
  