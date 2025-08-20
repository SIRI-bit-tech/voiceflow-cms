"use client"

import { useState } from "react"
import { useVoice } from "@/contexts/voice-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Navigation, Volume2, Compass, Move3D, Headphones } from "lucide-react"

interface Room {
  id: string
  name: string
  displayName: string
  description: string
  position: { x: number; y: number; z: number }
  contentCount: number
  ambientSound?: string
  color: string
}

interface ContentItem {
  id: string
  title: string
  type: "blog" | "page" | "draft"
  position: { x: number; y: number; z: number }
  room: string
  distance?: number
}

export function SpatialNavigator() {
  const { state, navigateToRoom, speakFeedback } = useVoice()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [nearbyContent, setNearbyContent] = useState<ContentItem[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const rooms: Room[] = [
    {
      id: "lobby",
      name: "lobby",
      displayName: "Main Lobby",
      description: "Central hub with overview of all content",
      position: { x: 0, y: 0, z: 0 },
      contentCount: 0,
      color: "bg-indigo-600",
    },
    {
      id: "blog-room",
      name: "blog-room",
      displayName: "Blog Room",
      description: "Published blog posts and articles",
      position: { x: -10, y: 0, z: -5 },
      contentCount: 12,
      ambientSound: "typing",
      color: "bg-green-600",
    },
    {
      id: "pages-wing",
      name: "pages-wing",
      displayName: "Pages Wing",
      description: "Static pages and documentation",
      position: { x: 10, y: 0, z: -5 },
      contentCount: 8,
      ambientSound: "pages",
      color: "bg-blue-600",
    },
    {
      id: "draft-corner",
      name: "draft-corner",
      displayName: "Draft Corner",
      description: "Work in progress and unpublished content",
      position: { x: 5, y: 0, z: 10 },
      contentCount: 5,
      ambientSound: "pencil",
      color: "bg-yellow-600",
    },
    {
      id: "archive-basement",
      name: "archive-basement",
      displayName: "Archive Basement",
      description: "Archived and historical content",
      position: { x: 0, y: -5, z: 0 },
      contentCount: 23,
      ambientSound: "archive",
      color: "bg-slate-600",
    },
  ]

  // Mock content data
  const mockContent: ContentItem[] = [
    {
      id: "1",
      title: "Getting Started with Angular",
      type: "blog",
      position: { x: -8, y: 0, z: -3 },
      room: "blog-room",
    },
    {
      id: "2",
      title: "Advanced TypeScript Patterns",
      type: "blog",
      position: { x: -12, y: 0, z: -7 },
      room: "blog-room",
    },
    {
      id: "3",
      title: "API Documentation",
      type: "page",
      position: { x: 8, y: 0, z: -3 },
      room: "pages-wing",
    },
    {
      id: "4",
      title: "Voice CMS Architecture",
      type: "draft",
      position: { x: 3, y: 0, z: 8 },
      room: "draft-corner",
    },
  ]

  const getCurrentRoom = () => {
    return rooms.find((room) => room.name === state.currentPosition.room) || rooms[0]
  }

  const calculateDistance = (pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }) => {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  const scanForContent = () => {
    setIsScanning(true)
    speakFeedback("Scanning for nearby content...")

    // Calculate distances to all content
    const contentWithDistances = mockContent.map((content) => ({
      ...content,
      distance: calculateDistance(state.currentPosition, content.position),
    }))

    // Filter content within reasonable distance (15 units)
    const nearby = contentWithDistances
      .filter((content) => content.distance! <= 15)
      .sort((a, b) => a.distance! - b.distance!)

    setNearbyContent(nearby)

    setTimeout(() => {
      setIsScanning(false)
      if (nearby.length > 0) {
        const contentList = nearby.map((c) => c.title).join(", ")
        speakFeedback(`Found ${nearby.length} content items nearby: ${contentList}`)
      } else {
        speakFeedback("No content found in your immediate vicinity")
      }
    }, 2000)
  }

  const handleRoomNavigation = (roomName: string) => {
    setSelectedRoom(roomName)
    navigateToRoom(roomName)

    const room = rooms.find((r) => r.name === roomName)
    if (room) {
      speakFeedback(`Navigating to ${room.displayName}. ${room.description}`)
    }
  }

  const provideDirectionalGuidance = () => {
    const currentRoom = getCurrentRoom()
    const otherRooms = rooms.filter((r) => r.id !== currentRoom.id)

    let guidance = `You are in the ${currentRoom.displayName}. `

    otherRooms.forEach((room) => {
      const dx = room.position.x - state.currentPosition.x
      const dz = room.position.z - state.currentPosition.z

      let direction = ""
      if (Math.abs(dx) > Math.abs(dz)) {
        direction = dx > 0 ? "to your right" : "to your left"
      } else {
        direction = dz > 0 ? "behind you" : "in front of you"
      }

      guidance += `${room.displayName} is ${direction}. `
    })

    speakFeedback(guidance)
  }

  const currentRoom = getCurrentRoom()

  return (
    <div className="space-y-6">
      {/* Current Location Header */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Building className="h-5 w-5" />
            Spatial Navigation
          </CardTitle>
          <CardDescription className="text-slate-300">
            Navigate through your content using 3D spatial audio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${currentRoom.color}`} />
              <div>
                <h3 className="font-semibold text-white">{currentRoom.displayName}</h3>
                <p className="text-sm text-slate-400">{currentRoom.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {currentRoom.contentCount} items
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3D Room Layout */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Move3D className="h-5 w-5" />
            Virtual Building Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-900 rounded-lg p-6 min-h-[300px]">
            {/* 3D Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Room Positions */}
            {rooms.map((room) => {
              const isCurrentRoom = room.name === state.currentPosition.room
              const x = ((room.position.x + 15) / 30) * 100 // Normalize to 0-100%
              const y = ((room.position.z + 15) / 30) * 100 // Normalize to 0-100%

              return (
                <div
                  key={room.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => handleRoomNavigation(room.name)}
                >
                  <div
                    className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${isCurrentRoom ? room.color + " ring-2 ring-white" : "bg-slate-700 hover:bg-slate-600"}
                    transition-all duration-200
                  `}
                  >
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xs text-center mt-1 text-slate-300 max-w-16">
                    {room.displayName.split(" ")[0]}
                  </div>
                  {room.contentCount > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs bg-slate-600 text-white">
                      {room.contentCount}
                    </Badge>
                  )}
                </div>
              )
            })}

            {/* Current Position Indicator */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4" />
              Position: ({state.currentPosition.x}, {state.currentPosition.y}, {state.currentPosition.z})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Navigation */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Navigation className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.map((room) => (
              <Button
                key={room.id}
                onClick={() => handleRoomNavigation(room.name)}
                variant={room.name === state.currentPosition.room ? "default" : "outline"}
                className="w-full justify-start"
              >
                <div className={`w-3 h-3 rounded-full ${room.color} mr-3`} />
                {room.displayName}
                {room.contentCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {room.contentCount}
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Spatial Audio Controls */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Headphones className="h-5 w-5" />
              Spatial Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={scanForContent} disabled={isScanning} className="w-full bg-purple-600 hover:bg-purple-700">
              <Compass className="h-4 w-4 mr-2" />
              {isScanning ? "Scanning..." : "Scan for Content"}
            </Button>

            <Button
              onClick={provideDirectionalGuidance}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Get Directions
            </Button>

            {/* Nearby Content */}
            {nearbyContent.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">Nearby Content:</h4>
                {nearbyContent.slice(0, 3).map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                    <span className="text-white">{content.title}</span>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {content.distance?.toFixed(1)}m
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Movement Instructions */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-amber-400">Spatial Navigation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Voice Commands:</h4>
              <ul className="space-y-1">
                <li>• &quot;Navigate to [room name]&quot;</li>
                <li>• &quot;Where am I?&quot;</li>
                <li>• &quot;What&apos;s around me?&quot;</li>
                <li>• &quot;Scan for content&quot;</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Audio Cues:</h4>
              <ul className="space-y-1">
                <li>• Volume indicates distance</li>
                <li>• Stereo positioning shows direction</li>
                <li>• Each room has unique ambient sounds</li>
                <li>• Content proximity affects audio clarity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
