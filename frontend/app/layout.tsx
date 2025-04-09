import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { DatabaseProvider } from "@/contexts/database-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <DatabaseProvider>{children}</DatabaseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

