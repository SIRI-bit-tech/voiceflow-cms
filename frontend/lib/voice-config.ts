// Voice processing configuration
export const VOICE_CONFIG = {
    // Speech Recognition Settings
    recognition: {
      language: "en-US",
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
    },
  
    // Speech Synthesis Settings
    synthesis: {
      voice: "en-US-Neural2-F",
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
    },
  
    // Spatial Audio Settings
    spatialAudio: {
      maxDistance: 50,
      rolloffFactor: 1,
      dopplerFactor: 1,
      speedOfSound: 343.3,
    },
  
    // Voice Commands
    commands: {
      navigation: [
        "navigate to dashboard",
        "go to blog room",
        "show me pages wing",
        "take me to draft corner",
        "visit archive basement",
        "return to lobby",
      ],
      content: [
        "create new blog post",
        "create new page",
        "show my content",
        "search for content",
        "publish content",
        "save as draft",
      ],
      system: ["login", "logout", "help", "settings", "calibrate audio", "switch workspace"],
    },
  
    // Biometric Authentication
    voiceBiometrics: {
      sampleDuration: 3000, // 3 seconds
      requiredSamples: 3,
      confidenceThreshold: 0.85,
      passphrases: ["Hello, this is my voice", "VoiceFlow CMS authentication", "My voice is my password"],
    },
  } as const
  