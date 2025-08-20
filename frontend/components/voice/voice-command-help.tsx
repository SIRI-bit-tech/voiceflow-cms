"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, FileText, Settings, Search, Mic } from "lucide-react"

interface CommandCategory {
  title: string
  icon: React.ReactNode
  color: string
  commands: Array<{
    phrase: string
    description: string
    example?: string
  }>
}

export function VoiceCommandHelp() {
  const commandCategories: CommandCategory[] = [
    {
      title: "Navigation",
      icon: <Navigation className="h-5 w-5" />,
      color: "text-blue-400",
      commands: [
        {
          phrase: "Navigate to [location]",
          description: "Move to different content areas",
          example: "Navigate to blog room",
        },
        {
          phrase: "Go to [location]",
          description: "Alternative navigation command",
          example: "Go to pages wing",
        },
        {
          phrase: "Where am I?",
          description: "Get current location information",
        },
        {
          phrase: "What's around me?",
          description: "Scan for nearby content",
        },
      ],
    },
    {
      title: "Content Management",
      icon: <FileText className="h-5 w-5" />,
      color: "text-green-400",
      commands: [
        {
          phrase: "Create new blog post",
          description: "Start creating a new blog article",
        },
        {
          phrase: "Create new page",
          description: "Start creating a new static page",
        },
        {
          phrase: "Show my content",
          description: "Display your content library",
        },
        {
          phrase: "Publish content",
          description: "Publish the current content",
        },
        {
          phrase: "Save as draft",
          description: "Save current work as draft",
        },
      ],
    },
    {
      title: "Search & Discovery",
      icon: <Search className="h-5 w-5" />,
      color: "text-yellow-400",
      commands: [
        {
          phrase: "Search for [query]",
          description: "Find content by keywords",
          example: "Search for Angular tutorials",
        },
        {
          phrase: "Show me [content type]",
          description: "Filter content by type",
          example: "Show me recent articles",
        },
        {
          phrase: "Find [content]",
          description: "Locate specific content",
          example: "Find my draft about React",
        },
      ],
    },
    {
      title: "System Controls",
      icon: <Settings className="h-5 w-5" />,
      color: "text-purple-400",
      commands: [
        {
          phrase: "Help",
          description: "Get voice command assistance",
        },
        {
          phrase: "Settings",
          description: "Open system settings",
        },
        {
          phrase: "Calibrate audio",
          description: "Recalibrate spatial audio",
        },
        {
          phrase: "Switch workspace",
          description: "Change to different workspace",
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Mic className="h-5 w-5" />
            Voice Commands Guide
          </CardTitle>
          <CardDescription className="text-slate-300">
            Available voice commands for VoiceFlow CMS navigation and content management
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {commandCategories.map((category) => (
          <Card key={category.title} className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${category.color}`}>
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.commands.map((command, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        Say:
                      </Badge>
                      <span className="text-sm font-medium text-white">&ldquo;{command.phrase}&ldquo;</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-12">{command.description}</p>
                    {command.example && (
                      <div className="ml-12">
                        <span className="text-xs text-slate-500">Example: </span>
                        <span className="text-xs text-slate-300 italic">&quot;{command.example}&quot;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-cyan-400">Voice Command Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Wait for audio confirmation before giving the next command</li>
            <li>• Use headphones for the best spatial audio experience</li>
            <li>• Commands are case-insensitive and flexible in phrasing</li>
            <li>• Say &quot;Help&quot; anytime to get voice assistance</li>
            <li>• Calibrate your voice during setup for better recognition</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
