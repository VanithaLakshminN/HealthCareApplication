import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "HealthCare Pro - Your Digital Health Partner",
  description: "Book appointments, access pharmacy, chat with AI, and manage your digital health records",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <Header/>
          {children}
          </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
