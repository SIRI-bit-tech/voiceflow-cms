"use client"

import { useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Mic, Navigation, Activity, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  const { state, loadUsers, loadContentAnalytics, loadVoiceAnalytics, loadSpatialAnalytics, loadSystemHealth } =
    useAdmin()

  useEffect(() => {
    loadUsers()
    loadContentAnalytics()
    loadVoiceAnalytics()
    loadSpatialAnalytics()
    loadSystemHealth()
  }, [])

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      default:
        return <Activity className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <BarChart3 className="h-6 w-6" />
            VoiceFlow CMS Admin Dashboard
          </CardTitle>
          <CardDescription className="text-slate-300">
            Monitor system performance, user activity, and content analytics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* System Health Overview */}
      {state.systemHealth && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthStatusIcon(state.systemHealth.status)}
              System Health
              <Badge className={`ml-2 ${getHealthStatusColor(state.systemHealth.status)}`}>
                {state.systemHealth.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Uptime</div>
                <div className="text-2xl font-bold text-green-400">{state.systemHealth.uptime}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Active Users</div>
                <div className="text-2xl font-bold text-blue-400">{state.systemHealth.activeUsers}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Memory Usage</div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{state.systemHealth.memoryUsage}%</div>
                  <Progress value={state.systemHealth.memoryUsage} className="h-2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">CPU Usage</div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{state.systemHealth.cpuUsage}%</div>
                  <Progress value={state.systemHealth.cpuUsage} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{state.users.length}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Content</p>
                <p className="text-2xl font-bold text-white">{state.contentAnalytics?.totalContent || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Voice Commands</p>
                <p className="text-2xl font-bold text-white">{state.voiceAnalytics?.totalVoiceCommands || 0}</p>
              </div>
              <Mic className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Spatial Interactions</p>
                <p className="text-2xl font-bold text-white">{state.spatialAnalytics?.spatialInteractions || 0}</p>
              </div>
              <Navigation className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="spatial">Spatial</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Content Analytics */}
        <TabsContent value="content" className="space-y-6">
          {state.contentAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-indigo-400">Content by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(state.contentAnalytics.contentByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize text-slate-300">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / state.contentAnalytics!.totalContent) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-indigo-400">Content by Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(state.contentAnalytics.contentByAuthor).map(([author, count]) => (
                        <div key={author} className="flex items-center justify-between">
                          <span className="text-slate-300">{author}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / state.contentAnalytics!.totalContent) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Popular Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.contentAnalytics.popularContent.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{content.title}</h4>
                          <p className="text-sm text-slate-400 capitalize">{content.type}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-white font-medium">{content.views}</div>
                            <div className="text-slate-400">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">{content.voiceInteractions}</div>
                            <div className="text-slate-400">Voice</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">{content.spatialVisits}</div>
                            <div className="text-slate-400">Spatial</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Voice Analytics */}
        <TabsContent value="voice" className="space-y-6">
          {state.voiceAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{state.voiceAnalytics.uniqueVoiceUsers}</div>
                      <div className="text-sm text-slate-400">Voice Users</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {state.voiceAnalytics.averageSessionDuration}m
                      </div>
                      <div className="text-sm text-slate-400">Avg Session</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {Math.round(state.voiceAnalytics.biometricSuccessRate * 100)}%
                      </div>
                      <div className="text-sm text-slate-400">Biometric Success</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Commands by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(state.voiceAnalytics.commandsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize text-slate-300">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{
                                width: `${(count / state.voiceAnalytics!.totalVoiceCommands) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Spatial Analytics */}
        <TabsContent value="spatial" className="space-y-6">
          {state.spatialAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{state.spatialAnalytics.totalRooms}</div>
                      <div className="text-sm text-slate-400">Total Rooms</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{state.spatialAnalytics.activeRooms}</div>
                      <div className="text-sm text-slate-400">Active Rooms</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">
                        {state.spatialAnalytics.averageNavigationTime}m
                      </div>
                      <div className="text-sm text-slate-400">Avg Navigation</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="text-indigo-400">Room Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(state.spatialAnalytics.roomVisits).map(([room, visits]) => (
                      <div key={room} className="flex items-center justify-between">
                        <span className="text-slate-300">
                          {room.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-cyan-500 h-2 rounded-full"
                              style={{
                                width: `${(visits / Math.max(...Object.values(state.spatialAnalytics!.roomVisits))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12 text-right">{visits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-indigo-400">User Management</CardTitle>
              <CardDescription className="text-slate-300">Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium text-white">{user.name}</h4>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          user.role === "admin"
                            ? "border-red-600 text-red-400"
                            : user.role === "editor"
                              ? "border-blue-600 text-blue-400"
                              : "border-slate-600 text-slate-400"
                        }`}
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        className={`${
                          user.status === "active"
                            ? "bg-green-600"
                            : user.status === "suspended"
                              ? "bg-red-600"
                              : "bg-slate-600"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="text-center">
                        <div className="text-white font-medium">{user.voiceProfile?.voiceCommandsUsed || 0}</div>
                        <div>Voice Commands</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{user.spatialNavigation?.roomsVisited.length || 0}</div>
                        <div>Rooms Visited</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{new Date(user.lastLogin).toLocaleDateString()}</div>
                        <div>Last Login</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
