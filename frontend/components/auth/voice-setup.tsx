"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, CheckCircle, AlertCircle, Volume2, Headphones } from "lucide-react"

interface VoiceSample {
  passphrase: string
  recorded: boolean
  quality: number
}

export function VoiceSetup() {
  const { setupVoiceBiometrics, state } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([
    { passphrase: "Hello, this is my voice", recorded: false, quality: 0 },
    { passphrase: "VoiceFlow CMS authentication", recorded: false, quality: 0 },
    { passphrase: "My voice is my password", recorded: false, quality: 0 },
  ])

  const steps = ["Audio Setup", "Voice Calibration", "Passphrase Recording", "Biometric Profile Creation"]

  const recordVoiceSample = async (index: number) => {
    setIsRecording(true)

    try {
      // Simulate recording process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate quality assessment
      const quality = Math.random() * 0.3 + 0.7 // 70-100% quality

      setVoiceSamples((prev) =>
        prev.map((sample, i) => (i === index ? { ...sample, recorded: true, quality } : sample)),
      )

      // Provide audio feedback
      const utterance = new SpeechSynthesisUtterance("Voice sample recorded successfully")
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Recording failed:", error)
    } finally {
      setIsRecording(false)
    }
  }

  const completeSetup = async () => {
    const passphrases = voiceSamples.map((s) => s.passphrase)
    await setupVoiceBiometrics(passphrases)
  }

  const allSamplesRecorded = voiceSamples.every((s) => s.recorded)
  const averageQuality = voiceSamples.reduce((acc, s) => acc + s.quality, 0) / voiceSamples.length
  const progress = (voiceSamples.filter((s) => s.recorded).length / voiceSamples.length) * 100

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-indigo-400">Voice Biometric Setup</CardTitle>
          <CardDescription className="text-slate-300">
            Create your unique voice profile for secure authentication
          </CardDescription>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index <= currentStep ? "text-indigo-400" : "text-slate-500"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    index < currentStep ? "bg-green-600" : index === currentStep ? "bg-indigo-600" : "bg-slate-600"
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                <span className="hidden sm:inline">{step}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <Headphones className="h-16 w-16 text-purple-400 mx-auto" />
              <h3 className="text-xl font-semibold">Audio Setup</h3>
              <p className="text-slate-300">
                Please ensure you have a good quality microphone and are in a quiet environment. Headphones are
                recommended for optimal voice recognition.
              </p>
              <Button onClick={() => setCurrentStep(1)} className="bg-indigo-600 hover:bg-indigo-700">
                Continue to Calibration
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <Volume2 className="h-16 w-16 text-green-400 mx-auto" />
              <h3 className="text-xl font-semibold">Voice Calibration</h3>
              <p className="text-slate-300">
                We&apos;ll test your microphone and adjust settings for optimal voice recognition.
              </p>
              <Button onClick={() => setCurrentStep(2)} className="bg-green-600 hover:bg-green-700">
                Start Voice Recording
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Mic className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Record Voice Passphrases</h3>
                <p className="text-slate-300">
                  Record each passphrase clearly. You&apos;ll use these for voice authentication.
                </p>
              </div>

              <div className="space-y-4">
                {voiceSamples.map((sample, index) => (
                  <div key={index} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Passphrase {index + 1}</span>
                      {sample.recorded && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Recorded
                        </Badge>
                      )}
                    </div>

                    <div className="text-lg text-indigo-300 mb-3 font-mono">&quot;{sample.passphrase}&quot;</div>

                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => recordVoiceSample(index)}
                        disabled={isRecording}
                        variant={sample.recorded ? "outline" : "default"}
                        className={sample.recorded ? "border-green-600 text-green-400" : "bg-red-600 hover:bg-red-700"}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording ? "Recording..." : sample.recorded ? "Re-record" : "Record"}
                      </Button>

                      {sample.recorded && (
                        <div className="text-sm text-slate-400">Quality: {(sample.quality * 100).toFixed(0)}%</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <Progress value={progress} className="mb-2" />
                  <span className="text-sm text-slate-400">
                    {voiceSamples.filter((s) => s.recorded).length} of {voiceSamples.length} samples recorded
                  </span>
                </div>

                {allSamplesRecorded && (
                  <Button onClick={() => setCurrentStep(3)} className="bg-indigo-600 hover:bg-indigo-700">
                    Create Voice Profile
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
              <h3 className="text-xl font-semibold">Create Biometric Profile</h3>
              <p className="text-slate-300">
                Finalizing your voice biometric profile with {(averageQuality * 100).toFixed(0)}% average quality.
              </p>

              {state.error && (
                <Alert className="border-red-700 bg-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{state.error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={completeSetup} disabled={state.isLoading} className="bg-green-600 hover:bg-green-700">
                {state.isLoading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
