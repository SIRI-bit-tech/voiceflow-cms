"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export function LoginForm() {
  const { state, login, voiceLogin } = useAuth()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [voiceCredentials, setVoiceCredentials] = useState({ username: "", passphrase: "" })
  const [isRecording, setIsRecording] = useState(false)

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(credentials)
  }

  const handleVoiceLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecording(true)

    try {
      await voiceLogin(voiceCredentials.username, voiceCredentials.passphrase)
    } finally {
      setIsRecording(false)
    }
  }

  const passphraseOptions = [
    "Hello, this is my voice",
    "VoiceFlow CMS authentication",
    "My voice is my password",
    "Secure voice access granted",
  ]

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-indigo-400">Welcome Back</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to VoiceFlow CMS using traditional login or voice authentication
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="traditional" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
            </TabsList>

            {/* Error Display */}
            {state.error && (
              <Alert className="border-red-700 bg-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Traditional Login */}
            <TabsContent value="traditional">
              <form onSubmit={handleTraditionalLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={state.isLoading}>
                  {state.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Voice Login */}
            <TabsContent value="voice">
              <form onSubmit={handleVoiceLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={voiceCredentials.username}
                    onChange={(e) => setVoiceCredentials({ ...voiceCredentials, username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphrase" className="text-slate-300">
                    Voice Passphrase
                  </Label>
                  <select
                    value={voiceCredentials.passphrase}
                    onChange={(e) => setVoiceCredentials({ ...voiceCredentials, passphrase: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  >
                    <option value="">Select a passphrase</option>
                    {passphraseOptions.map((phrase) => (
                      <option key={phrase} value={phrase}>
                        {phrase}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Authentication Status */}
                {state.voiceAuthAttempts > 0 && (
                  <div className="text-sm text-yellow-400">
                    Voice authentication attempts: {state.voiceAuthAttempts}/3
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={state.voiceAuthInProgress || isRecording || state.voiceAuthAttempts >= 3}
                >
                  {isRecording ? (
                    <>
                      <Mic className="h-4 w-4 mr-2 animate-pulse" />
                      Recording Voice...
                    </>
                  ) : state.voiceAuthInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Sign In
                    </>
                  )}
                </Button>

                {state.voiceAuthAttempts >= 3 && (
                  <Alert className="border-red-700 bg-red-900/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      Too many voice authentication attempts. Please use traditional login.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </TabsContent>
          </Tabs>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Button variant="link" className="text-slate-400 hover:text-white">
                Forgot your password?
              </Button>
            </div>

            <div className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="text-indigo-400 hover:text-indigo-300 p-0">
                Sign up here
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
