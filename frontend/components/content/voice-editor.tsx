"use client"

import { useState, useRef } from "react"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, RotateCcw, Save, Volume2 } from "lucide-react"

interface VoiceEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
}

export function VoiceEditor({ content, onChange, onSave }: VoiceEditorProps) {
  const { startListening, stopListening, speakFeedback } = useVoice()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleStartDictation = async () => {
    setIsRecording(true)
    await startListening()
    speakFeedback("Voice dictation started. Begin speaking.")
  }

  const handleStopDictation = async () => {
    setIsRecording(false)
    await stopListening()
    speakFeedback("Voice dictation stopped.")
  }

  const handleInsertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)

    onChange(newContent)

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("new paragraph")) {
      handleInsertText("\n\n")
      speakFeedback("New paragraph added")
    } else if (lowerCommand.includes("new line")) {
      handleInsertText("\n")
      speakFeedback("New line added")
    } else if (lowerCommand.includes("save")) {
      onSave?.()
      speakFeedback("Content saved")
    } else if (lowerCommand.includes("clear all")) {
      onChange("")
      speakFeedback("Content cleared")
    } else if (lowerCommand.includes("read content")) {
      speakFeedback(content || "No content to read")
    } else {
      // Regular dictation
      handleInsertText(command + " ")
    }
  }

  const handleReadAloud = () => {
    if (content) {
      speakFeedback(content)
    } else {
      speakFeedback("No content to read")
    }
  }

  const handleUndo = () => {
    // Simple undo - could be enhanced with proper history
    speakFeedback("Undo functionality - say 'clear all' to reset content")
  }

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Mic className="h-5 w-5" />
            Voice Editor
          </CardTitle>
          <CardDescription className="text-slate-300">
            Use voice commands to write and edit content hands-free
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={isRecording ? handleStopDictation : handleStartDictation}
              className={`${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Dictation
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Dictation
                </>
              )}
            </Button>

            <Button
              onClick={handleReadAloud}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Read Aloud
            </Button>

            <Button
              onClick={handleUndo}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>

            {onSave && (
              <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <Badge variant="outline" className="border-red-600 text-red-400">
                  Recording
                </Badge>
                <span className="text-sm text-slate-300">Listening for voice input...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Editor */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="pt-6">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing or use voice dictation... Say 'new paragraph', 'new line', 'save', or 'read content'"
            className="min-h-[400px] bg-slate-700 border-slate-600 text-white resize-none"
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement
              setCursorPosition(target.selectionStart)
            }}
          />

          <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
            <div>
              Words: {content.split(/\s+/).filter((word) => word.length > 0).length} | Characters: {content.length}
            </div>
            <div>Cursor: {cursorPosition}</div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands Help */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300">&quot;New paragraph&quot; - Add paragraph break</div>
            <div className="text-slate-300">&ldquo;New line&ldquo; - Add line break</div>
            <div className="text-slate-300">&quot;Save&quot; - Save current content</div>
            <div className="text-slate-300">&quot;Clear all&quot; - Clear all content</div>
            <div className="text-slate-300">&quot;Read content&quot; - Read content aloud</div>
            <div className="text-slate-300">Or just speak to add text</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
