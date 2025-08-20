"use client"

import { ContentCreator } from "./content-creator"
import { ContentLibrary } from "./content-library"
import { VoiceControlPanel } from "../voice/voice-control-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Library, Mic, BarChart3 } from "lucide-react"

export function ContentDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-400 mb-2">Content Management</h1>
          <p className="text-slate-300">Create, edit, and manage content using voice commands and spatial navigation</p>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Control
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <ContentCreator />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <ContentLibrary />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoiceControlPanel />
              <div className="space-y-6">
                {/* Content Voice Commands */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Content Voice Commands</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Create new blog post&ldquo;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Start dictation&quot;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Save content&quot;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Publish content&quot;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Search for [query]&quot;</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">Analytics Coming Soon</h3>
              <p className="text-slate-500">Content analytics and insights will be available in the next update</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
