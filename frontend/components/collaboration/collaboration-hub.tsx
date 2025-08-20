"use client"

import { useState } from "react"
import { useCollaboration } from "@/contexts/collaboration-context"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Users,
  Mic,
  MicOff,
  Video,
  Navigation,
  MessageSquare,
  Share,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react"
import type { SessionParticipant } from "@/types/collaboration"

export function CollaborationHub() {
  const { state, startCollaboration, joinCollaboration, leaveCollaboration, updateLocation, sendVoiceMessage } =
    useCollaboration()
  const { state: voiceState, startListening, stopListening, speakFeedback } = useVoice()
  const [voiceMessage, setVoiceMessage] = useState("")
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isSpatialAudioEnabled, setIsSpatialAudioEnabled] = useState(true)

  const handleStartSession = async (type: "content-editing" | "meeting" | "brainstorming" | "review") => {
    if (state.currentWorkspace) {
      await startCollaboration(state.currentWorkspace.id, type)
      await joinCollaboration(`session-${Date.now()}`)
    }
  }

  const handleLeaveSession = async () => {
    await leaveCollaboration()
    speakFeedback("Left collaboration session")
  }

  const handleSendVoiceMessage = async () => {
    if (voiceMessage.trim() && state.activeSession) {
      await sendVoiceMessage(voiceMessage, state.activeSession.currentRoom)
      setVoiceMessage("")
    }
  }

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    speakFeedback(isVoiceEnabled ? "Voice disabled" : "Voice enabled")
  }

  const handleToggleSpatialAudio = () => {
    setIsSpatialAudioEnabled(!isSpatialAudioEnabled)
    speakFeedback(isSpatialAudioEnabled ? "Spatial audio disabled" : "Spatial audio enabled")
  }

  const getParticipantStatusColor = (status: SessionParticipant["voiceStatus"]) => {
    switch (status) {
      case "speaking":
        return "border-green-500 bg-green-500/20"
      case "listening":
        return "border-blue-500 bg-blue-500/20"
      case "muted":
        return "border-slate-500 bg-slate-500/20"
      default:
        return "border-slate-600"
    }
  }

  const getParticipantStatusIcon = (status: SessionParticipant["voiceStatus"]) => {
    switch (status) {
      case "speaking":
        return <Mic className="h-3 w-3 text-green-400" />
      case "listening":
        return <Volume2 className="h-3 w-3 text-blue-400" />
      case "muted":
        return <MicOff className="h-3 w-3 text-slate-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Collaboration Status */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Users className="h-5 w-5" />
            Collaboration Hub
          </CardTitle>
          <CardDescription className="text-slate-300">
            {state.activeSession
              ? `Active ${state.activeSession.type} session in ${state.currentWorkspace?.name}`
              : "Start a collaboration session with your team"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!state.activeSession ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleStartSession("content-editing")}
                className="bg-indigo-600 hover:bg-indigo-700 h-20 flex-col"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                Content Editing
              </Button>
              <Button
                onClick={() => handleStartSession("meeting")}
                className="bg-green-600 hover:bg-green-700 h-20 flex-col"
              >
                <Video className="h-6 w-6 mb-2" />
                Meeting
              </Button>
              <Button
                onClick={() => handleStartSession("brainstorming")}
                className="bg-purple-600 hover:bg-purple-700 h-20 flex-col"
              >
                <Share className="h-6 w-6 mb-2" />
                Brainstorming
              </Button>
              <Button
                onClick={() => handleStartSession("review")}
                className="bg-orange-600 hover:bg-orange-700 h-20 flex-col"
              >
                <Settings className="h-6 w-6 mb-2" />
                Review
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-green-600">
                  <Play className="h-3 w-3 mr-1" />
                  Active Session
                </Badge>
                <span className="text-sm text-slate-300">
                  {state.activeSession.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className="text-sm text-slate-400">{state.participants.length} participants</span>
              </div>
              <Button
                onClick={handleLeaveSession}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-900/50 bg-transparent"
              >
                <Pause className="h-4 w-4 mr-2" />
                Leave Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {state.activeSession && (
        <>
          {/* Voice Controls */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-indigo-400">Voice & Audio Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleToggleVoice}
                  className={`${isVoiceEnabled ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {isVoiceEnabled ? (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice On
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Voice Off
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleToggleSpatialAudio}
                  variant="outline"
                  className={`border-slate-600 ${
                    isSpatialAudioEnabled ? "text-cyan-400 hover:bg-cyan-900/50" : "text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {isSpatialAudioEnabled ? (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Spatial Audio On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Spatial Audio Off
                    </>
                  )}
                </Button>

                <div className="flex-1 flex gap-2">
                  <Input
                    value={voiceMessage}
                    onChange={(e) => setVoiceMessage(e.target.value)}
                    placeholder="Type a voice message or use voice commands..."
                    className="bg-slate-700 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === "Enter" && handleSendVoiceMessage()}
                  />
                  <Button onClick={handleSendVoiceMessage} className="bg-indigo-600 hover:bg-indigo-700">
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-400">
                <Users className="h-5 w-5" />
                Participants ({state.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className={`p-4 rounded-lg border-2 transition-colors ${getParticipantStatusColor(participant.voiceStatus)}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/avatars/${participant.userId}.jpg`} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{participant.name}</h4>
                          {getParticipantStatusIcon(participant.voiceStatus)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {participant.currentLocation.room.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-slate-500">
                          Joined: {new Date(participant.joinTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {state.participants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">No Participants</h3>
                  <p className="text-slate-500">Invite team members to join the collaboration session</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="shared">Shared Content</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Session Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.activeSession.voiceActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium text-white">
                            {state.participants.find((p) => p.userId === activity.userId)?.name || "Unknown"}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {activity.type} in {activity.room}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 ml-auto">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {state.activeSession.voiceActivity.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No activity yet. Start collaborating to see activity here.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shared">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Shared Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    No shared content yet. Share documents, images, or other content during the session.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Available Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  {state.currentWorkspace?.spatialLayout.rooms.map((room) => (
                    <div key={room.id} className="p-4 bg-slate-700 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{room.name}</h4>
                          <p className="text-sm text-slate-400 capitalize">{room.type} room</p>
                          <div className="text-xs text-slate-500">
                            {room.currentOccupants.length}/{room.capacity} occupants
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => updateLocation(room.id, room.position.x, room.position.y, room.position.z)}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Enter
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
