declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

// Voice recognition and command processing
export class VoiceRecognitionEngine {
    private recognition: SpeechRecognition | null = null
    private isListening: boolean = false
    private commandCallbacks: Map<string, (params?: unknown) => void> = new Map()
  
    constructor() {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  
    private setupRecognition(): void {
      if (!this.recognition) return
  
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"
      this.recognition.maxAlternatives = 3

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = Array.from(event.results) as SpeechRecognitionResult[]
        const transcript = results
          .map((result) => result[0].transcript)
          .join(" ")
          .toLowerCase()
          .trim()
  
        if (event.results[event.results.length - 1].isFinal) {
          this.processCommand(transcript)
        }
      }
  
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          alert("Microphone access is required for voice commands")
        }
      }
  
      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart recognition if it stops unexpectedly
          setTimeout(() => this.recognition?.start(), 100)
        }
      }
    }
  
    startListening(): void {
      if (!this.recognition) {
        console.error("Speech recognition not supported")
        return
      }
  
      this.isListening = true
      this.recognition.start()
    }
  
    stopListening(): void {
      this.isListening = false
      if (this.recognition) {
        this.recognition.stop()
      }
    }
  
    registerCommand(pattern: string, callback: (params?: unknown) => void): void {
      this.commandCallbacks.set(pattern.toLowerCase(), callback)
    }
  
    private processCommand(transcript: string): void {
      console.log("Processing command:", transcript)
  
      // Navigation commands
      if (transcript.includes("navigate to") || transcript.includes("go to")) {
        if (transcript.includes("dashboard") || transcript.includes("lobby")) {
          this.executeCommand("navigate", { target: "lobby" })
        } else if (transcript.includes("blog")) {
          this.executeCommand("navigate", { target: "blog-room" })
        } else if (transcript.includes("pages")) {
          this.executeCommand("navigate", { target: "pages-wing" })
        } else if (transcript.includes("draft")) {
          this.executeCommand("navigate", { target: "draft-corner" })
        } else if (transcript.includes("archive")) {
          this.executeCommand("navigate", { target: "archive-basement" })
        }
      }
  
      // Content commands
      else if (transcript.includes("create new")) {
        if (transcript.includes("blog post")) {
          this.executeCommand("create-content", { type: "blog" })
        } else if (transcript.includes("page")) {
          this.executeCommand("create-content", { type: "page" })
        }
      }
  
      // System commands
      else if (transcript.includes("help")) {
        this.executeCommand("help")
      } else if (transcript.includes("settings")) {
        this.executeCommand("settings")
      } else if (transcript.includes("calibrate")) {
        this.executeCommand("calibrate-audio")
      }
  
      // Search commands
      else if (transcript.includes("show me") || transcript.includes("find")) {
        const searchTerm = transcript.replace(/show me|find|search for/g, "").trim()
        this.executeCommand("search", { query: searchTerm })
      }
    }
  
    private executeCommand(command: string, params?: unknown): void {
      const callback = this.commandCallbacks.get(command)
      if (callback) {
        callback(params)
      } else {
        console.log(`Command not found: ${command}`)
        // Provide audio feedback
        const utterance = new SpeechSynthesisUtterance(`Command not recognized: ${command}`)
        speechSynthesis.speak(utterance)
      }
    }
  }
  