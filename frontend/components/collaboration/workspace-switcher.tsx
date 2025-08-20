"use client"

import { useState } from "react"
import { useCollaboration } from "@/contexts/collaboration-context"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building2, Plus, Users, Settings, Mic, Navigation, CheckCircle } from "lucide-react"
import type { Workspace } from "@/types/collaboration"

export function WorkspaceSwitcher() {
  const { state, createWorkspace, switchWorkspace } = useCollaboration()
  const { speakFeedback } = useVoice()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    isPublic: false,
    allowVoiceCollaboration: true,
    enableSpatialAudio: true,
    maxMembers: 25,
  })

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      speakFeedback("Please provide a workspace name")
      return
    }

    const workspaceData: Omit<Workspace, "id" | "createdAt" | "updatedAt"> = {
      name: newWorkspace.name,
      description: newWorkspace.description,
      ownerId: "current-user", // Replace with actual user ID
      ownerName: "Current User", // Replace with actual user name
      members: [],
      settings: {
        isPublic: newWorkspace.isPublic,
        allowVoiceCollaboration: newWorkspace.allowVoiceCollaboration,
        enableSpatialAudio: newWorkspace.enableSpatialAudio,
        maxMembers: newWorkspace.maxMembers,
        contentApprovalRequired: false,
        voiceCommandsEnabled: true,
        spatialNavigationEnabled: true,
      },
      spatialLayout: {
        rooms: [
          {
            id: "default-room",
            name: "Main Hub",
            type: "content",
            position: { x: 0, y: 0, z: 0 },
            capacity: newWorkspace.maxMembers,
            currentOccupants: [],
            permissions: {
              whoCanEnter: "members",
              whoCanSpeak: "members",
              whoCanEdit: "members",
            },
            voiceSettings: {
              spatialAudioEnabled: newWorkspace.enableSpatialAudio,
              voiceActivation: true,
              backgroundNoise: false,
            },
          },
        ],
        connections: [],
        sharedSpaces: [],
      },
      isActive: true,
    }

    await createWorkspace(workspaceData)
    setIsCreateDialogOpen(false)
    setNewWorkspace({
      name: "",
      description: "",
      isPublic: false,
      allowVoiceCollaboration: true,
      enableSpatialAudio: true,
      maxMembers: 25,
    })
  }

  const handleSwitchWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId)
  }

  return (
    <div className="space-y-6">
      {/* Current Workspace */}
      {state.currentWorkspace && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Building2 className="h-5 w-5" />
              Current Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{state.currentWorkspace.name}</h3>
                <p className="text-sm text-slate-400">{state.currentWorkspace.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Users className="h-3 w-3" />
                    {state.currentWorkspace.members.length} members
                  </div>
                  {state.currentWorkspace.settings.allowVoiceCollaboration && (
                    <Badge variant="outline" className="border-purple-600 text-purple-400">
                      <Mic className="h-3 w-3 mr-1" />
                      Voice Enabled
                    </Badge>
                  )}
                  {state.currentWorkspace.settings.enableSpatialAudio && (
                    <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                      <Navigation className="h-3 w-3 mr-1" />
                      Spatial Audio
                    </Badge>
                  )}
                  {state.isConnected && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Workspaces */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-indigo-400">Available Workspaces</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-indigo-400">Create New Workspace</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Set up a new collaborative workspace for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Workspace Name</label>
                    <Input
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      placeholder="Enter workspace name..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <Textarea
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      placeholder="Describe the purpose of this workspace..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Maximum Members</label>
                    <Select
                      value={newWorkspace.maxMembers.toString()}
                      onValueChange={(value) =>
                        setNewWorkspace({ ...newWorkspace, maxMembers: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="10">10 members</SelectItem>
                        <SelectItem value="25">25 members</SelectItem>
                        <SelectItem value="50">50 members</SelectItem>
                        <SelectItem value="100">100 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-300">Public Workspace</label>
                        <p className="text-xs text-slate-400">Allow anyone to discover and join</p>
                      </div>
                      <Switch
                        checked={newWorkspace.isPublic}
                        onCheckedChange={(checked) => setNewWorkspace({ ...newWorkspace, isPublic: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-300">Voice Collaboration</label>
                        <p className="text-xs text-slate-400">Enable voice commands and communication</p>
                      </div>
                      <Switch
                        checked={newWorkspace.allowVoiceCollaboration}
                        onCheckedChange={(checked) =>
                          setNewWorkspace({ ...newWorkspace, allowVoiceCollaboration: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-300">Spatial Audio</label>
                        <p className="text-xs text-slate-400">Enable 3D spatial audio navigation</p>
                      </div>
                      <Switch
                        checked={newWorkspace.enableSpatialAudio}
                        onCheckedChange={(checked) => setNewWorkspace({ ...newWorkspace, enableSpatialAudio: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWorkspace} className="bg-indigo-600 hover:bg-indigo-700">
                      Create Workspace
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`p-4 rounded-lg border transition-colors ${
                  state.currentWorkspace?.id === workspace.id
                    ? "bg-indigo-900/30 border-indigo-600"
                    : "bg-slate-700 border-slate-600 hover:bg-slate-650"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{workspace.name}</h4>
                      {workspace.settings.isPublic && (
                        <Badge variant="outline" className="border-green-600 text-green-400">
                          Public
                        </Badge>
                      )}
                      {workspace.settings.allowVoiceCollaboration && (
                        <Badge variant="outline" className="border-purple-600 text-purple-400">
                          <Mic className="h-3 w-3 mr-1" />
                          Voice
                        </Badge>
                      )}
                      {workspace.settings.enableSpatialAudio && (
                        <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                          <Navigation className="h-3 w-3 mr-1" />
                          Spatial
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{workspace.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {workspace.members.length}/{workspace.settings.maxMembers} members
                      </div>
                      <div>Owner: {workspace.ownerName}</div>
                      <div>Created: {new Date(workspace.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {state.currentWorkspace?.id !== workspace.id && (
                      <Button
                        onClick={() => handleSwitchWorkspace(workspace.id)}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Switch
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {state.workspaces.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Workspaces</h3>
                <p className="text-slate-500 mb-4">Create your first workspace to start collaborating</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
