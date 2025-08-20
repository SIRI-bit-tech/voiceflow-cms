"use client"

import { useState } from "react"
import { useContent } from "@/contexts/content-context"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Mic, MicOff, Save, Send, AlertCircle, Loader2 } from "lucide-react"

// Define types for dictation session
interface DictationSession {
  id: string;
  // Add other properties as needed
}

export function ContentCreator() {
  const { state, createContent, updateContent, startDictation, stopDictation, publishContent } = useContent()
  const { speakFeedback } = useVoice()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [contentType, setContentType] = useState<"blog" | "page">("blog")
  const [isDictating, setIsDictating] = useState(false)
  const [dictationSession, setDictationSession] = useState<DictationSession | null>(null)

  const handleCreateContent = async () => {
    if (!title.trim()) {
      speakFeedback("Please provide a title for your content")
      return
    }

    try {
      await createContent(contentType, title)
      setTitle("")
      setContent("")
      speakFeedback(`${contentType} created. You can now start writing or dictating content.`)
    } catch (error) {
      console.error("Failed to create content:", error)
    }
  }

  const handleStartDictation = async () => {
    if (!state.currentItem) {
      speakFeedback("Please create or select content first")
      return
    }

    try {
      setIsDictating(true)
      const session = await startDictation(state.currentItem.id)
      setDictationSession(session)
      speakFeedback("Dictation started. Begin speaking your content.")
    } catch (error) {
      setIsDictating(false)
      console.error("Failed to start dictation:", error)
    }
  }

  const handleStopDictation = async () => {
    if (!dictationSession) return

    try {
      const transcript = await stopDictation(dictationSession.id)
      setContent((prev) => prev + " " + transcript)
      setIsDictating(false)
      setDictationSession(null)
      speakFeedback("Dictation complete. Content has been added.")
    } catch (error) {
      setIsDictating(false)
      console.error("Failed to stop dictation:", error)
    }
  }

  const handleSaveContent = async () => {
    if (!state.currentItem) return

    try {
      await updateContent(state.currentItem.id, {
        content,
        metadata: {
          type: state.currentItem.metadata?.type || "blog",
          wordCount: content.split(/\s+/).filter(Boolean).length,
          readingTime: Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
          seoTitle: state.currentItem.metadata?.seoTitle || "",
          seoDescription: state.currentItem.metadata?.seoDescription || "",
          featuredImage: state.currentItem.metadata?.featuredImage || "",
          lastEditedBy: state.currentItem.metadata?.lastEditedBy || "",
          version: (state.currentItem.metadata?.version || 0) + 1,
        },
      })
    } catch (error) {
      console.error("Failed to save content:", error)
    }
  }

  const handlePublishContent = async () => {
    if (!state.currentItem) return

    try {
      await handleSaveContent()
      await publishContent(state.currentItem.id)
    } catch (error) {
      console.error("Failed to publish content:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Creation Header */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <FileText className="h-5 w-5" />
            Voice Content Creator
          </CardTitle>
          <CardDescription className="text-slate-300">
            Create and edit content using voice commands and dictation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Alert className="border-red-700 bg-red-900/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">{state.error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="edit">Edit Content</TabsTrigger>
        </TabsList>

        {/* Create New Content */}
        <TabsContent value="create" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-green-400">Create New Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter content title..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-300">
                    Content Type
                  </Label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as "blog" | "page")}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="blog">Blog Post</option>
                    <option value="page">Static Page</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCreateContent}
                disabled={state.isCreating || !title.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {state.isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create {contentType}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Content */}
        <TabsContent value="edit" className="space-y-6">
          {state.currentItem ? (
            <div className="space-y-6">
              {/* Content Info */}
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400">{state.currentItem.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {state.currentItem.metadata?.type || "unknown"}
                      </Badge>
                      <Badge
                        variant={state.currentItem.status === "published" ? "default" : "secondary"}
                        className={state.currentItem.status === "published" ? "bg-green-600" : "bg-yellow-600"}
                      >
                        {state.currentItem.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-slate-300">
                    {state.currentItem.metadata?.wordCount || 0} words • {state.currentItem.metadata?.readingTime || 0} min read
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Voice Dictation Controls */}
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Mic className="h-5 w-5" />
                    Voice Dictation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isDictating ? handleStopDictation : handleStartDictation}
                      className={isDictating ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {isDictating ? (
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

                    {isDictating && (
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-sm">Recording...</span>
                      </div>
                    )}
                  </div>

                  {isDictating && (
                    <Alert className="border-red-700 bg-red-900/50">
                      <Mic className="h-4 w-4" />
                      <AlertDescription className="text-red-300">
                        Dictation is active. Speak clearly and naturally. Your words will be transcribed automatically.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-purple-400">Content Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start typing or use voice dictation to add content..."
                    className="min-h-[300px] bg-slate-700 border-slate-600 text-white"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">{content.split(/\s+/).filter(Boolean).length} words</div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSaveContent}
                        disabled={state.isEditing}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>

                      <Button
                        onClick={handlePublishContent}
                        disabled={state.isEditing}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Content Selected</h3>
                <p className="text-slate-500">Create new content or select existing content to edit</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}