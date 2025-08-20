"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { VoiceOnboarding } from "@/components/voice/voice-onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Mic, Headphones, ArrowRight, LogIn, UserPlus } from "lucide-react"

export default function HomePage() {
  const { state, login, register } = useAuth()
  const { user } = state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })

  if (user && showOnboarding) {
    return <VoiceOnboarding />
  }

  if (user && !showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-indigo-400 mb-2">Welcome back, {user.full_name}!</CardTitle>
            <CardDescription className="text-slate-300 text-lg">Ready to continue with VoiceFlow CMS?</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setShowOnboarding(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Start Voice Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showAuth) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (isLogin) {
          await login({ email: formData.email, password: formData.password })
        } else {
          await register({ email: formData.email, password: formData.password, full_name: formData.fullName })
        }
      } catch (error) {
        console.error("Authentication error:", error)
      }
    }

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-indigo-400 mb-2">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription className="text-slate-300">
              {isLogin ? "Welcome back to VoiceFlow CMS" : "Join VoiceFlow CMS today"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="fullName" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 hover:text-indigo-300"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAuth(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-indigo-400 mb-2">Welcome to VoiceFlow CMS</CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            Revolutionary Voice-First Content Management System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <Building className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">3D Navigation</h3>
              <p className="text-sm text-slate-400">Navigate content in virtual 3D space</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <Mic className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">Voice Control</h3>
              <p className="text-sm text-slate-400">Complete voice-controlled CMS</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <Headphones className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">Spatial Audio</h3>
              <p className="text-sm text-slate-400">Immersive binaural audio experience</p>
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-4">
            <p className="text-slate-300">
              Experience content management like never before with spatial audio navigation, voice biometric
              authentication, and screen-optional operation designed for accessibility and innovation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => {
                setIsLogin(true)
                setShowAuth(true)
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button
              onClick={() => {
                setIsLogin(false)
                setShowAuth(true)
              }}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>

          {/* Requirements Note */}
          <div className="text-center text-sm text-slate-400 border-t border-slate-700 pt-4">
            <p>
              <strong>Requirements:</strong> Microphone access and headphones recommended for optimal experience
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
