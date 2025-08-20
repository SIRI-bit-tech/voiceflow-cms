"use client"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Mic, MicOff, Volume2, VolumeX, Headphones, Activity, MapPin } from "lucide-react"

export function VoiceControlPanel() {
  const { state, startListening, stopListening, toggleAudioFeedback, toggleSpatialAudio, speakFeedback } = useVoice()

  const handleVoiceToggle = () => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleTestAudio = () => {
    speakFeedback("Audio test successful. Voice processing is working correctly.")
  }

  const getRoomDisplayName = (room: string) => {
    const roomNames: Record<string, string> = {
      lobby: "Main Lobby",
      "blog-room": "Blog Room",
      "pages-wing": "Pages Wing",
      "draft-corner": "Draft Corner",
      "archive-basement": "Archive Basement",
    }
    return roomNames[room] || room
  }

  return (
    <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-400">
          <Activity className="h-5 w-5" />
          Voice Control Panel
        </CardTitle>
        <CardDescription className="text-slate-300">Manage voice commands and spatial audio settings</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Voice Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state.isListening ? (
              <Mic className="h-5 w-5 text-green-400" />
            ) : (
              <MicOff className="h-5 w-5 text-slate-400" />
            )}
            <span className="text-sm font-medium">Voice Commands</span>
          </div>
          <Badge variant={state.isListening ? "default" : "secondary"}>
            {state.isListening ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Main Voice Toggle */}
        <Button
          onClick={handleVoiceToggle}
          className={`w-full ${state.isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          disabled={state.isProcessing}
        >
          {state.isProcessing ? (
            "Processing..."
          ) : state.isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>

        {/* Current Position */}
        <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="text-sm">Current Location</span>
          </div>
          <span className="text-sm font-medium text-cyan-400">{getRoomDisplayName(state.currentPosition.room)}</span>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {state.audioFeedbackEnabled ? (
                <Volume2 className="h-4 w-4 text-blue-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
              <span className="text-sm">Audio Feedback</span>
            </div>
            <Switch checked={state.audioFeedbackEnabled} onCheckedChange={toggleAudioFeedback} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Spatial Audio</span>
            </div>
            <Switch checked={state.spatialAudioEnabled} onCheckedChange={toggleSpatialAudio} />
          </div>
        </div>

        {/* Test Audio Button */}
        <Button
          onClick={handleTestAudio}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Test Audio
        </Button>

        {/* Last Command Display */}
        {state.lastTranscript && (
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Last Command:</div>
            <div className="text-sm text-white">{state.lastTranscript}</div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="text-xs text-red-400 mb-1">Error:</div>
            <div className="text-sm text-red-300">{state.error}</div>
          </div>
        )}

        {/* Voice Calibration Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Voice Calibrated:</span>
          <Badge variant={state.voiceCalibrated ? "default" : "secondary"}>
            {state.voiceCalibrated ? "Yes" : "No"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
