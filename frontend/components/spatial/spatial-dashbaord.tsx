"use client"
import { SpatialNavigator } from "./spatial-navigator"
import { ContentRadar } from "./content-radar"
import { VoiceControlPanel } from "../voice/voice-control-panel"
import { VoiceCommandHelp } from "../voice/voice-command-help"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Radar, Mic, HelpCircle } from "lucide-react"

export function SpatialDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-400 mb-2">VoiceFlow CMS - Spatial Navigation</h1>
          <p className="text-slate-300">Navigate your content using voice commands and 3D spatial audio</p>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="navigator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="navigator" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Navigator
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              Content Radar
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Control
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="navigator" className="space-y-6">
            <SpatialNavigator />
          </TabsContent>

          <TabsContent value="radar" className="space-y-6">
            <ContentRadar />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoiceControlPanel />
              <div className="space-y-6">
                {/* Voice Status Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-indigo-400 mb-4">Voice Navigation Status</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Speech Recognition:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spatial Audio:</span>
                      <span className="text-green-400">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Voice Biometrics:</span>
                      <span className="text-yellow-400">Calibrating</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audio Feedback:</span>
                      <span className="text-green-400">On</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Quick Voice Actions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Navigate to blog room&quot;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &ldquo;Scan for content&ldquo;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Where am I?&quot;</div>
                    <div className="p-2 bg-slate-700 rounded text-slate-300">Say: &quot;Create new blog post&quot;</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <VoiceCommandHelp />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
