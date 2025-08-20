"use client"

import { useState } from "react"
import { useVoice } from "@/contexts/voice-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Radar, FileText, Eye, Volume2, Navigation2 } from "lucide-react"

interface ContentRadarItem {
  id: string
  title: string
  type: "blog" | "page" | "draft"
  distance: number
  direction: string
  angle: number
  position: { x: number; y: number; z: number }
}

export function ContentRadar() {
  const { state, speakFeedback } = useVoice()
  const [radarContent, setRadarContent] = useState<ContentRadarItem[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  // Mock content data with positions
  const mockContent = [
    {
      id: "1",
      title: "Getting Started with Angular",
      type: "blog" as const,
      position: { x: -8, y: 0, z: -3 },
    },
    {
      id: "2",
      title: "Advanced TypeScript Patterns",
      type: "blog" as const,
      position: { x: -12, y: 0, z: -7 },
    },
    {
      id: "3",
      title: "API Documentation",
      type: "page" as const,
      position: { x: 8, y: 0, z: -3 },
    },
    {
      id: "4",
      title: "Voice CMS Architecture",
      type: "draft" as const,
      position: { x: 3, y: 0, z: 8 },
    },
    {
      id: "5",
      title: "Spatial Audio Implementation",
      type: "draft" as const,
      position: { x: 7, y: 0, z: 12 },
    },
  ]

  const calculateDistance = (pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }) => {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  const calculateDirection = (from: { x: number; z: number }, to: { x: number; z: number }) => {
    const dx = to.x - from.x
    const dz = to.z - from.z
    const angle = Math.atan2(dz, dx) * (180 / Math.PI)

    // Convert to compass directions
    if (angle >= -22.5 && angle < 22.5) return "East"
    if (angle >= 22.5 && angle < 67.5) return "Southeast"
    if (angle >= 67.5 && angle < 112.5) return "South"
    if (angle >= 112.5 && angle < 157.5) return "Southwest"
    if (angle >= 157.5 || angle < -157.5) return "West"
    if (angle >= -157.5 && angle < -112.5) return "Northwest"
    if (angle >= -112.5 && angle < -67.5) return "North"
    if (angle >= -67.5 && angle < -22.5) return "Northeast"
    return "Unknown"
  }

  const performRadarScan = async () => {
    setIsScanning(true)
    setScanProgress(0)
    speakFeedback("Initiating content radar scan...")

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Calculate content positions relative to user
    const userPos = state.currentPosition
    const contentWithRadarData: ContentRadarItem[] = mockContent.map((content) => {
      const distance = calculateDistance(userPos, content.position)
      const direction = calculateDirection(
        { x: userPos.x, z: userPos.z },
        { x: content.position.x, z: content.position.z },
      )
      const angle = Math.atan2(content.position.z - userPos.z, content.position.x - userPos.x) * (180 / Math.PI)

      return {
        ...content,
        distance,
        direction,
        angle,
      }
    })

    // Filter content within radar range (20 units)
    const inRangeContent = contentWithRadarData
      .filter((content) => content.distance <= 20)
      .sort((a, b) => a.distance - b.distance)

    setTimeout(() => {
      setRadarContent(inRangeContent)
      setIsScanning(false)
      setScanProgress(0)

      if (inRangeContent.length > 0) {
        const nearestContent = inRangeContent[0]
        speakFeedback(
          `Radar scan complete. Found ${inRangeContent.length} content items. ` +
            `Nearest item: "${nearestContent.title}" at ${nearestContent.distance.toFixed(1)} units ${nearestContent.direction}.`,
        )
      } else {
        speakFeedback("Radar scan complete. No content detected within range.")
      }
    }, 2000)
  }

  const navigateToContent = (content: ContentRadarItem) => {
    speakFeedback(
      `Navigating to "${content.title}". It's ${content.distance.toFixed(1)} units ${content.direction} from your current position.`,
    )
    // This would trigger navigation to the content's position
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 text-green-400" />
      case "page":
        return <FileText className="h-4 w-4 text-blue-400" />
      case "draft":
        return <FileText className="h-4 w-4 text-yellow-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  const getDistanceColor = (distance: number) => {
    if (distance <= 5) return "text-green-400"
    if (distance <= 10) return "text-yellow-400"
    if (distance <= 15) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Radar Control Panel */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Radar className="h-5 w-5" />
            Content Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={performRadarScan} disabled={isScanning} className="w-full bg-green-600 hover:bg-green-700">
            <Radar className="h-4 w-4 mr-2" />
            {isScanning ? "Scanning..." : "Perform Radar Scan"}
          </Button>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Scanning for content...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Radar Display */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Navigation2 className="h-5 w-5" />
            Radar Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-900 rounded-lg p-6 min-h-[300px]">
            {/* Radar Grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Concentric circles */}
                {[1, 2, 3, 4].map((ring) => (
                  <div
                    key={ring}
                    className="absolute border border-green-500/30 rounded-full"
                    style={{
                      width: `${ring * 25}%`,
                      height: `${ring * 25}%`,
                      top: `${50 - ring * 12.5}%`,
                      left: `${50 - ring * 12.5}%`,
                    }}
                  />
                ))}

                {/* Cross lines */}
                <div className="absolute w-full h-px bg-green-500/30 top-1/2 transform -translate-y-1/2" />
                <div className="absolute h-full w-px bg-green-500/30 left-1/2 transform -translate-x-1/2" />

                {/* Center point (user position) */}
                <div className="absolute w-3 h-3 bg-indigo-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

                {/* Content blips */}
                {radarContent.map((content) => {
                  const normalizedDistance = Math.min(content.distance / 20, 1) // Normalize to 0-1
                  const radius = normalizedDistance * 120 // Max radius of 120px
                  const angleRad = (content.angle * Math.PI) / 180
                  const x = Math.cos(angleRad) * radius
                  const y = Math.sin(angleRad) * radius

                  return (
                    <div
                      key={content.id}
                      className="absolute w-2 h-2 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transition-colors"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => navigateToContent(content)}
                      title={content.title}
                    />
                  )
                })}
              </div>
            </div>

            {/* Radar Info */}
            <div className="absolute bottom-4 left-4 text-xs text-slate-400">
              <div>Range: 20 units</div>
              <div>Items detected: {radarContent.length}</div>
            </div>

            {/* Direction Labels */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">N</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">S</div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">W</div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">E</div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      {radarContent.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Eye className="h-5 w-5" />
              Detected Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {radarContent.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                  onClick={() => navigateToContent(content)}
                >
                  <div className="flex items-center gap-3">
                    {getContentTypeIcon(content.type)}
                    <div>
                      <h4 className="font-medium text-white">{content.title}</h4>
                      <p className="text-sm text-slate-400">
                        {content.direction} • {content.distance.toFixed(1)} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {content.type}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
