"use client"

import { useState } from "react"
import { useContent } from "@/contexts/content-context"
import { useVoice } from "@/contexts/voice-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Calendar, User, MapPin, Edit, Trash2, Send, Archive, Volume2 } from "lucide-react"
import type { ContentItem } from "@/types/content"

export function ContentLibrary() {
  const { state, setCurrentContent, deleteContent, publishContent, searchContent } = useContent()
  const { speakFeedback, navigateToRoom } = useVoice()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "blog" | "page" | "draft">("all")

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchContent(searchQuery)
      speakFeedback(`Searching for "${searchQuery}"`)
    }
  }

  const handleContentSelect = (item: ContentItem) => {
    setCurrentContent(item)
    speakFeedback(`Selected ${item.type}: ${item.title}`)
  }

  const handleNavigateToContent = (item: ContentItem) => {
    navigateToRoom(item.position.room)
    speakFeedback(`Navigating to ${item.title} in ${item.position.room}`)
  }

  const handleDeleteContent = async (item: ContentItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await deleteContent(item.id)
    }
  }

  const handlePublishContent = async (item: ContentItem) => {
    await publishContent(item.id)
  }

  const filteredContent = state.items.filter((item) => {
    if (selectedFilter !== "all" && item.type !== selectedFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-600"
      case "draft":
        return "bg-yellow-600"
      case "scheduled":
        return "bg-blue-600"
      case "archived":
        return "bg-slate-600"
      default:
        return "bg-slate-600"
    }
  }

  const getTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Library Header */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Archive className="h-5 w-5" />
            Content Library
          </CardTitle>
          <CardDescription className="text-slate-300">
            Manage and organize your content with voice commands and spatial navigation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content... (or say 'Search for [query]')"
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as "all" | "blog" | "page" | "draft")}
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="all">All Content</option>
                <option value="blog">Blog Posts</option>
                <option value="page">Pages</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card
                key={item.id}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-750 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {item.type}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                  <CardTitle className="text-lg text-white line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="text-slate-400 line-clamp-2">
                    {item.excerpt || "No excerpt available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.authorName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-400">
                  <div>{item.metadata?.wordCount} words</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.position.room}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleContentSelect(item)}
                      size="sm"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleNavigateToContent(item)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>

                    {item.status === "draft" && (
                      <Button
                        onClick={() => handlePublishContent(item)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDeleteContent(item)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-700">
                {filteredContent.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(item.type)}
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {item.type}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.authorName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </div>
                          <div>{item.metadata?.wordCount} words</div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.position.room}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleContentSelect(item)}
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>

                        <Button
                          onClick={() => handleNavigateToContent(item)}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>

                        {item.status === "draft" && (
                          <Button
                            onClick={() => handlePublishContent(item)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDeleteContent(item)}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Content Found</h3>
            <p className="text-slate-500">
              {searchQuery
                ? `No content matches "${searchQuery}"`
                : "Create your first piece of content to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
