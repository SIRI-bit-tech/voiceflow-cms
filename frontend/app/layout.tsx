import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { VoiceProvider } from "@/contexts/voice-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ContentProvider } from "@/contexts/content-context"
import { AdminProvider } from "@/contexts/admin-context"

export const metadata: Metadata = {
  title: "VoiceFlow CMS",
  description: "Revolutionary Voice-First Content Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <VoiceProvider>
            <ContentProvider>
              <AdminProvider>{children}</AdminProvider>
            </ContentProvider>
          </VoiceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
