import type { Metadata } from "next"
import "./globals.css"
import NavBar from "@/components/NavBar"

export const metadata: Metadata = {
  title: "奖励卡片",
  description: "小朋友的奖励卡片管理应用",
}

export const viewport = "width=device-width, initial-scale=1, maximum-scale=1"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-purple-50/50 font-sans pb-20 md:pb-4 md:pl-56">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
