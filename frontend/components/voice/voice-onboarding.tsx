"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Headphones, Volume2, CheckCircle } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export function VoiceOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSamples, setVoiceSamples] = useState<string[]>([])
  const [spatialCalibrated, setSpatialCalibrated] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to VoiceFlow CMS",
      description: "A revolutionary voice-first content management system",
      icon: <Volume2 className="h-8 w-8" />,
      completed: false,
    },
    {
      id: "voice-calibration",
      title: "Voice Calibration",
      description: "Record your voice pattern for biometric authentication",
      icon: <Mic className="h-8 w-8" />,
      completed: voiceSamples.length >= 3,
    },
    {
      id: "spatial-setup",
      title: "Spatial Audio Setup",
      description: "Calibrate 3D audio positioning with your headphones",
      icon: <Headphones className="h-8 w-8" />,
      completed: spatialCalibrated,
    },
    {
      id: "command-training",
      title: "Voice Command Training",
      description: "Learn basic navigation and content commands",
      icon: <CheckCircle className="h-8 w-8" />,
      completed: false,
    },
  ]

  const recordVoiceSample = async () => {
    setIsRecording(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(blob)
        setVoiceSamples((prev) => [...prev, audioUrl])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()

      // Record for 3 seconds
      setTimeout(() => {
        mediaRecorder.stop()
        setIsRecording(false)
      }, 3000)

      // Provide audio guidance
      const utterance = new SpeechSynthesisUtterance(
        `Please say: "Hello, this is my voice" clearly into your microphone`,
      )
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setIsRecording(false)
    }
  }

  const calibrateSpatialAudio = () => {
    // Simulate spatial audio calibration
    const utterance = new SpeechSynthesisUtterance(
      "Put on your headphones. You will hear a sound moving around you in 3D space.",
    )
    speechSynthesis.speak(utterance)

    // Simulate calibration process
    setTimeout(() => {
      setSpatialCalibrated(true)
      const confirmUtterance = new SpeechSynthesisUtterance(
        "Spatial audio calibration complete. You can now navigate content in 3D space.",
      )
      speechSynthesis.speak(confirmUtterance)
    }, 5000)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-indigo-400">VoiceFlow CMS Setup</CardTitle>
          <CardDescription className="text-slate-300">
            Complete the setup to start using voice-controlled content management
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
            <div className="text-indigo-400">{steps[currentStep].icon}</div>
            <div>
              <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
              <p className="text-slate-300">{steps[currentStep].description}</p>
            </div>
          </div>

          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <p className="text-slate-300">
                VoiceFlow CMS uses spatial audio and voice commands to create an immersive, accessible content
                management experience.
              </p>
              <Button onClick={() => setCurrentStep(1)} className="bg-indigo-600 hover:bg-indigo-700">
                Start Setup
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Record your voice 3 times to create a biometric profile for secure authentication.
              </p>
              <div className="flex items-center justify-between">
                <span>Voice samples: {voiceSamples.length}/3</span>
                <Button
                  onClick={recordVoiceSample}
                  disabled={isRecording || voiceSamples.length >= 3}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRecording ? "Recording..." : "Record Voice Sample"}
                </Button>
              </div>
              {voiceSamples.length >= 3 && (
                <Button onClick={() => setCurrentStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Continue to Spatial Setup
                </Button>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-slate-300">Calibrate your headphones for 3D spatial audio navigation.</p>
              <Button
                onClick={calibrateSpatialAudio}
                disabled={spatialCalibrated}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {spatialCalibrated ? "Calibration Complete" : "Start Spatial Calibration"}
              </Button>
              {spatialCalibrated && (
                <Button onClick={() => setCurrentStep(3)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Continue to Command Training
                </Button>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-slate-300">Learn basic voice commands for navigation and content management.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-700 p-3 rounded">
                  <h4 className="font-semibold text-indigo-400">Navigation</h4>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    <li>&quot;Navigate to dashboard&quot;</li>
                    <li>&quot;Go to blog room&quot;</li>
                    <li>&quot;Show pages wing&quot;</li>
                  </ul>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <h4 className="font-semibold text-green-400">Content</h4>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    <li>&quot;Create new blog post&quot;</li>
                    <li>&quot;Show my content&quot;</li>
                    <li>&quot;Publish content&quot;</li>
                  </ul>
                </div>
              </div>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Complete Setup & Enter VoiceFlow CMS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
